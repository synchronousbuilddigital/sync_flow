"use server"

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
      // Initialize zero-padded arrays for the last 30 days
      const days = [];
      for (let i = 29; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        days.push(d.toISOString().split('T')[0]);
      }
      
      const timeSeriesRes = await ytAnalytics.reports.query({
        ids: 'channel==MINE',
        startDate,
        endDate,
        metrics: 'views,subscribersGained,subscribersLost',
        dimensions: 'day',
        sort: 'day'
      });

      const rowMap = new Map();
      if (timeSeriesRes.data.rows) {
        timeSeriesRes.data.rows.forEach((row: any) => {
           rowMap.set(row[0], row);
        });
      }

      followerData = days.map(day => {
        const row = rowMap.get(day);
        if (row) {
          return { date: day.substring(5), views: row[1], subscribers: row[2] - row[3] };
        }
        return { date: day.substring(5), views: 0, subscribers: 0 };
      });

      balanceData = days.map(day => {
        const row = rowMap.get(day);
        if (row) {
          return { date: day.substring(5), gained: row[2], lost: row[3] };
        }
        return { date: day.substring(5), gained: 0, lost: 0 };
      });

      // 2. Demographics (Age & Gender)
      const demoRes = await ytAnalytics.reports.query({
        ids: 'channel==MINE',
        startDate,
        endDate,
        metrics: 'viewerPercentage',
        dimensions: 'ageGroup,gender',
      });

      if (demoRes.data.rows && demoRes.data.rows.length > 0) {
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
      } else {
        genderData = [{ name: 'No Data', value: 100 }];
        ageData = [{ age: 'No Data', value: 0 }];
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

export type ThreadsAnalytics = {
  followers: number;
  likes: number;
  replies: number;
  topPosts: any[];
  error?: string;
  isMock?: boolean;
}

export async function getThreadsAnalytics(accountId: string): Promise<ThreadsAnalytics> {
  const supabase = await createClient()

  // Verify user is logged in
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { followers: 0, likes: 0, replies: 0, topPosts: [], error: "Unauthorized" }
  }

  // Get the account from DB
  const { data: account, error: accError } = await supabase
    .from('social_accounts')
    .select('*')
    .eq('id', accountId)
    .single()

  if (accError || !account) {
    return { followers: 0, likes: 0, replies: 0, topPosts: [], error: "Account not found" }
  }

  // If it's not Threads, return mock
  if (account.network !== 'Threads') {
    return {
      followers: 24500,
      likes: 12000,
      replies: 3400,
      topPosts: [
        { id: 1, caption: "Demo post for " + account.network, likes: 1200, replies: 300, views: 5000, thumbnail: "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&q=80&w=200" }
      ],
      isMock: true
    }
  }

  // For Threads, fetch real data
  const accessToken = account.access_token;
  if (!accessToken) {
    return { followers: 0, likes: 0, replies: 0, topPosts: [], error: "No access token found" }
  }

  try {
    // 1. Fetch Follower Count
    let followers = 0;
    const insightsRes = await fetch(`https://graph.threads.net/v1.0/me/threads_insights?metric=followers_count&access_token=${accessToken}`);
    const insightsData = await insightsRes.json();
    
    if (insightsData.data && insightsData.data.length > 0) {
       followers = insightsData.data[0]?.total_value?.value || insightsData.data[0]?.values?.[0]?.value || 0;
    } else if (insightsData.error) {
       console.error("Threads Insights Error:", insightsData.error);
       if (insightsData.error.message.includes("permission")) {
         return { followers: 0, likes: 0, replies: 0, topPosts: [], error: "Missing 'threads_manage_insights' permission. Please reconnect your Threads account." }
       }
       return { followers: 0, likes: 0, replies: 0, topPosts: [], error: insightsData.error.message }
    }

    // 2. Fetch Recent Threads (Posts)
    const threadsRes = await fetch(`https://graph.threads.net/v1.0/me/threads?fields=id,text,media_product_type,media_url,permalink&access_token=${accessToken}`);
    const threadsData = await threadsRes.json();
    
    let totalLikes = 0;
    let totalReplies = 0;
    const topPosts = [];
    
    if (threadsData.data) {
       const recentThreads = threadsData.data.slice(0, 5);
       
       for (const thread of recentThreads) {
          const metricRes = await fetch(`https://graph.threads.net/v1.0/${thread.id}/insights?metric=views,likes,replies,reposts,quotes&access_token=${accessToken}`);
          const metricData = await metricRes.json();
          
          let threadLikes = 0;
          let threadReplies = 0;
          let threadViews = 0;
          
          if (metricData.data) {
            metricData.data.forEach((m: any) => {
               if (m.name === 'likes') threadLikes = m.values?.[0]?.value || 0;
               if (m.name === 'replies') threadReplies = m.values?.[0]?.value || 0;
               if (m.name === 'views') threadViews = m.values?.[0]?.value || 0;
            });
          }
          
          totalLikes += threadLikes;
          totalReplies += threadReplies;
          
          topPosts.push({
             id: thread.id,
             caption: thread.text || "Media Post",
             likes: threadLikes,
             replies: threadReplies,
             views: threadViews,
             thumbnail: thread.media_url || null,
             permalink: thread.permalink
          });
       }
    }
    
    topPosts.sort((a, b) => b.likes - a.likes);

    return {
      followers,
      likes: totalLikes,
      replies: totalReplies,
      topPosts,
      isMock: false
    }

  } catch (error: any) {
    console.error("Analytics fetch failed:", error);
    return { followers: 0, likes: 0, replies: 0, topPosts: [], error: error.message || "Failed to fetch analytics" }
  }
}
