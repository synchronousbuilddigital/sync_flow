import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state'); // This contains our brandId
  const error = searchParams.get('error');

  if (error) {
    return NextResponse.redirect(`${new URL(request.url).origin}/dashboard?error=${error}`);
  }

  if (!code || !state) {
    return NextResponse.json({ error: "Missing code or state" }, { status: 400 });
  }

  const brandId = state;
  const redirectUri = `${new URL(request.url).origin}/api/auth/instagram/callback`;
  const appId = process.env.INSTAGRAM_CLIENT_ID || process.env.FACEBOOK_APP_ID;
  const appSecret = process.env.INSTAGRAM_CLIENT_SECRET || process.env.FACEBOOK_APP_SECRET;

  if (!appId || !appSecret) {
    return NextResponse.json({ error: "INSTAGRAM_CLIENT_ID or INSTAGRAM_CLIENT_SECRET is not configured" }, { status: 500 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(`${new URL(request.url).origin}/login`);
  }

  try {
    // 1. Exchange code for user access token
    const tokenUrl = `https://graph.facebook.com/v17.0/oauth/access_token?client_id=${appId}&redirect_uri=${encodeURIComponent(redirectUri)}&client_secret=${appSecret}&code=${code}`;
    const tokenResponse = await fetch(tokenUrl);
    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok) {
      console.error("Instagram token error:", tokenData);
      return NextResponse.redirect(`${new URL(request.url).origin}/dashboard?error=instagram_auth_failed`);
    }

    let accessToken = tokenData.access_token;

    // 2. Exchange for long-lived access token
    const longLivedUrl = `https://graph.facebook.com/v17.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${appId}&client_secret=${appSecret}&fb_exchange_token=${accessToken}`;
    const longLivedResponse = await fetch(longLivedUrl);
    const longLivedData = await longLivedResponse.json();

    if (longLivedResponse.ok && longLivedData.access_token) {
      accessToken = longLivedData.access_token;
    }

    // 3. Fetch user's Facebook Pages
    const pagesResponse = await fetch(`https://graph.facebook.com/v17.0/me/accounts?access_token=${accessToken}`);
    const pagesData = await pagesResponse.json();

    if (!pagesResponse.ok || !pagesData.data || pagesData.data.length === 0) {
      console.error("Pages fetch error or no pages found:", pagesData);
      return NextResponse.redirect(`${new URL(request.url).origin}/dashboard?error=no_facebook_pages_found`);
    }

    let instagramAccountId = null;
    let instagramUsername = null;

    // 4. Find an Instagram Business Account connected to one of the Pages
    for (const page of pagesData.data) {
      const igResponse = await fetch(`https://graph.facebook.com/v17.0/${page.id}?fields=instagram_business_account&access_token=${accessToken}`);
      const igData = await igResponse.json();

      if (igData.instagram_business_account) {
        instagramAccountId = igData.instagram_business_account.id;
        
        // Fetch Instagram Username
        const igProfileResponse = await fetch(`https://graph.facebook.com/v17.0/${instagramAccountId}?fields=username&access_token=${accessToken}`);
        const igProfileData = await igProfileResponse.json();
        
        if (igProfileData.username) {
          instagramUsername = igProfileData.username;
          break; // Stop at the first valid Instagram account we find
        }
      }
    }

    if (!instagramAccountId || !instagramUsername) {
      return NextResponse.redirect(`${new URL(request.url).origin}/dashboard?error=no_instagram_business_account`);
    }

    // 5. Save to database
    const { data: brand } = await supabase.from('brands').select('name').eq('id', brandId).single();

    // Store the instagramAccountId in refresh_token field as a hack, or append it to account_handle? 
    // We'll store it as part of the access_token string so it's easy to retrieve, or we can just fetch it live later. 
    // Wait, let's just store the Facebook Page Access Token or User Access token. The user access token can publish if it has permissions.
    // Actually, we must store the instagramAccountId to publish to it. Let's store it in `refresh_token` column since we don't need a real refresh token for long-lived tokens.
    
    const { error: insertError } = await supabase
      .from('social_accounts')
      .upsert({
        user_id: user.id,
        brand_id: brandId,
        brand_name: brand?.name || "Unknown Brand",
        network: 'Instagram',
        account_handle: instagramUsername,
        access_token: accessToken,
        refresh_token: instagramAccountId, // Using this column to store the IG Account ID
        token_expires_at: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
      }, { onConflict: 'user_id,brand_id,network,account_handle' });

    if (insertError) {
      console.error("Supabase insert error:", insertError);
      return NextResponse.redirect(`${new URL(request.url).origin}/dashboard?error=database_error`);
    }

    // Redirect back to dashboard indicating success
    return NextResponse.redirect(`${new URL(request.url).origin}/dashboard?network=Instagram&account=${instagramUsername}`);
  } catch (err) {
    console.error("Instagram callback exception:", err);
    return NextResponse.redirect(`${new URL(request.url).origin}/dashboard?error=server_error`);
  }
}
