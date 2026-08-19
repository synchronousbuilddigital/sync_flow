import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
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
    // 1. Exchange code for short-lived user access token
    const tokenFormData = new FormData();
    tokenFormData.append('client_id', appId);
    tokenFormData.append('client_secret', appSecret);
    tokenFormData.append('grant_type', 'authorization_code');
    tokenFormData.append('redirect_uri', redirectUri);
    tokenFormData.append('code', code);

    // Always use api.instagram.com for the token exchange for Instagram Login
    const tokenResponse = await fetch('https://api.instagram.com/oauth/access_token', {
      method: 'POST',
      body: tokenFormData
    });
    
    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok) {
      console.error("Instagram token error:", tokenData);
      const errorMsg = tokenData.error_message || tokenData.error?.message || tokenData.error_type || 'unknown_error';
      return NextResponse.redirect(`${new URL(request.url).origin}/dashboard?error=instagram_auth_failed&reason=${encodeURIComponent(errorMsg)}`);
    }

    const shortLivedToken = tokenData.access_token;
    const instagramAccountId = tokenData.user_id; // Sometimes provided directly by token exchange

    // 2. Try to get long-lived access token
    let accessToken = shortLivedToken;
    const longLivedUrl = `https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_secret=${appSecret}&access_token=${shortLivedToken}`;
    const longLivedResponse = await fetch(longLivedUrl);
    const longLivedData = await longLivedResponse.json();

    if (longLivedResponse.ok && longLivedData.access_token) {
      accessToken = longLivedData.access_token;
    }

    // 3. Fetch user's Instagram Profile (Username and ID)
    let profileData: any = {};
    let finalAccountId = instagramAccountId;
    let finalUsername = "";

    // Try Graph API endpoint (v19.0) first
    let profileResponse = await fetch(`https://graph.instagram.com/v19.0/me?fields=id,username&access_token=${accessToken}`);
    profileData = await profileResponse.json();

    // Fallback to legacy Basic Display endpoint if it fails (Unsupported request)
    if (!profileResponse.ok || !profileData.username) {
      console.log("v19.0/me failed, falling back to /me:", profileData);
      profileResponse = await fetch(`https://graph.instagram.com/me?fields=id,username&access_token=${accessToken}`);
      profileData = await profileResponse.json();
    }

    if (!profileResponse.ok || !profileData.username) {
      console.error("Instagram profile fetch error:", profileData);
      const errorMsg = profileData.error?.message || 'unknown_error';
      return NextResponse.redirect(`${new URL(request.url).origin}/dashboard?error=instagram_profile_failed&reason=${encodeURIComponent(errorMsg)}`);
    }

    finalAccountId = profileData.id || instagramAccountId;
    finalUsername = profileData.username;

    // 4. Save to database
    const { data: brand } = await supabase.from('brands').select('name').eq('id', brandId).single();

    // Check if account already exists
    const { data: existingAccount } = await supabase
      .from('social_accounts')
      .select('id')
      .eq('user_id', user.id)
      .eq('network', 'Instagram')
      .eq('account_handle', finalUsername)
      .maybeSingle();

    let insertError;

    if (existingAccount) {
      const { error } = await supabase
        .from('social_accounts')
        .update({
          brand_id: brandId,
          brand_name: brand?.name || "Unknown Brand",
          access_token: accessToken,
          refresh_token: finalAccountId,
          token_expires_at: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
        })
        .eq('id', existingAccount.id);
      insertError = error;
    } else {
      const { error } = await supabase
        .from('social_accounts')
        .insert([{
          user_id: user.id,
          brand_id: brandId,
          brand_name: brand?.name || "Unknown Brand",
          network: 'Instagram',
          account_handle: finalUsername,
          access_token: accessToken,
          refresh_token: finalAccountId,
          token_expires_at: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
        }]);
      insertError = error;
    }

    if (insertError) {
      console.error("Supabase insert error:", insertError);
      return NextResponse.redirect(`${new URL(request.url).origin}/dashboard?error=database_error`);
    }

    return NextResponse.redirect(`${new URL(request.url).origin}/dashboard?network=Instagram&account=${finalUsername}`);
  } catch (err) {
    console.error("Instagram callback exception:", err);
    return NextResponse.redirect(`${new URL(request.url).origin}/dashboard?error=server_error`);
  }
}
