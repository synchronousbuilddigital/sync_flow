content = """"use server"

import { createClient } from "@/lib/supabase/server"
import { google } from "googleapis"

export type ChannelAnalytics = {
  followers: number;
  views: number;
  posts: number;
  followerData: { date: string, views: number, subscribers: number }[];
  balanceData: { date: string, gained: number, lost: number }[];
  genderData: { name: string, value: number }[];
  ageData: { age: string, value: number }[];
  countryData: { name: string, value: number }[];
}

export async function getYouTubeAnalytics(brandId: string, accountHandle: string): Promise<ChannelAnalytics | null> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    // Fetch the YouTube account details for this brand
    const { data: account, error: accError } = await supabase
      .from('social_accounts')
      .select('*')
      .eq('user_id', user.id)
      .eq('brand_id', brandId)
      .eq('network', 'YouTube')
      .eq('account_handle', accountHandle)
      .limit(1)
      .single()

    if (accError || !account || !account.access_token) {
      console.error("YouTube account not found or missing tokens")
      return null
    }

    const oauth2Client = new google.auth.OAuth2(
      process.env.YOUTUBE_CLIENT_ID,
      process.env.YOUTUBE_CLIENT_SECRET
    )

    oauth2Client.setCredentials({
      access_token: account.access_token,
      refresh_token: account.refresh_token,
    })

    // Automatically save new tokens to Supabase if Google refreshes them
    oauth2Client.on('tokens', async (tokens) => {
      const updates: any = {};
      if (tokens.access_token) updates.access_token = tokens.access_token;
      if (tokens.refresh_token) updates.refresh_token = tokens.refresh_token;
      if (tokens.expiry_date) {
        updates.token_expires_at = new Date(tokens.expiry_date).toISOString();
      }

      await supabase
        .from('social_accounts')
        .update(updates)
        .eq('id', account.id);
    });

    const youtube = google.youtube({ version: "v3", auth: oauth2Client });
    const ytAnalytics = google.youtubeAnalytics({ version: "v2", auth: oauth2Client });

    // Fetch channel statistics
    const response = await youtube.channels.list({
      part: ["statistics"],
      mine: true,
    })

    const items = response.data.items
    if (!items || items.length === 0) {
      return null
    }

    const stats = items[0].statistics
    const totalSubs = parseInt(stats?.subscriberCount || '0', 10);
    const totalViews = parseInt(stats?.viewCount || '0', 10);
    const totalVideos = parseInt(stats?.videoCount || '0', 10);

    // Setup dates for Analytics queries (Last 30 Days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = thirtyDaysAgo.toISOString().split('T')[0];

    // Placeholder data structures (fallback if API fails or has no data)
    let followerData: any[] = [];
    let balanceData: any[] = [];
    let genderData: any[] = [];
    let ageData: any[] = [];
    let countryData: any[] = [];

    try {
      // 1. Time-series growth & balance
      const timeSeriesRes = await ytAnalytics.reports.query({
        ids: 'channel==MINE',
        startDate,
        endDate,
        metrics: 'views,subscribersGained,subscribersLost',
        dimensions: 'day',
        sort: 'day'
      });

      if (timeSeriesRes.data.rows) {
        let runningSubs = totalSubs; // Simplified: we don't know the exact starting point without more math, we'll map views instead
        followerData = timeSeriesRes.data.rows.map((row: any) => {
          const [date, views, gained, lost] = row;
          return {
            date: date.substring(5), // 'YYYY-MM-DD' -> 'MM-DD'
            views: views,
            subscribers: gained - lost, // Net change
          };
        });

        balanceData = timeSeriesRes.data.rows.map((row: any) => {
          const [date, views, gained, lost] = row;
          return {
            date: date.substring(5),
            gained: gained,
            lost: lost,
          };
        });
      }

      // 2. Demographics (Age & Gender)
      const demoRes = await ytAnalytics.reports.query({
        ids: 'channel==MINE',
        startDate,
        endDate,
        metrics: 'viewerPercentage',
        dimensions: 'ageGroup,gender',
      });

      if (demoRes.data.rows) {
        const genders: Record<string, number> = { male: 0, female: 0 };
        const ages: Record<string, number> = {};

        demoRes.data.rows.forEach((row: any) => {
          const [ageGroup, gender, percentage] = row;
          if (gender === 'male' || gender === 'female') {
             genders[gender] += percentage;
          }
          const formattedAge = ageGroup.replace('age', '');
          ages[formattedAge] = (ages[formattedAge] || 0) + percentage;
        });

        genderData = [
          { name: 'Male', value: Math.round(genders.male) },
          { name: 'Female', value: Math.round(genders.female) }
        ].filter(d => d.value > 0);

        ageData = Object.entries(ages).map(([age, value]) => ({
          age, value: Math.round(value)
        }));
      }

      // 3. Geography
      const geoRes = await ytAnalytics.reports.query({
        ids: 'channel==MINE',
        startDate,
        endDate,
        metrics: 'views',
        dimensions: 'country',
        sort: '-views',
        maxResults: 5,
      });

      if (geoRes.data.rows) {
        countryData = geoRes.data.rows.map((row: any) => ({
          name: row[0],
          value: row[1]
        }));
      }
    } catch (e) {
      console.error("Could not fetch advanced historical analytics (maybe scopes missing):", e);
    }
    
    return {
      followers: totalSubs,
      views: totalViews,
      posts: totalVideos,
      followerData,
      balanceData,
      genderData,
      ageData,
      countryData
    }

  } catch (error) {
    console.error("Failed to fetch YouTube analytics:", error)
    return null
  }
}
"""

with open("src/app/actions/analytics.ts", "w") as f:
    f.write(content)
print("Updated analytics action with advanced queries")
