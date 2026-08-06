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
  const redirectUri = `${new URL(request.url).origin}/api/auth/threads/callback`;
  const appId = process.env.THREADS_APP_ID;
  const appSecret = process.env.THREADS_APP_SECRET;

  if (!appId || !appSecret) {
    return NextResponse.json({ error: "THREADS_APP_ID or THREADS_APP_SECRET is not configured" }, { status: 500 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(`${new URL(request.url).origin}/login`);
  }

  try {
    // 1. Exchange code for short-lived access token
    const tokenResponse = await fetch('https://graph.threads.net/oauth/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: appId,
        client_secret: appSecret,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
        code,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok) {
      console.error("Threads token error:", tokenData);
      return NextResponse.redirect(`${new URL(request.url).origin}/dashboard?error=threads_auth_failed`);
    }

    let accessToken = tokenData.access_token;
    const threadsUserId = tokenData.user_id;

    // 2. Exchange for long-lived access token (valid 60 days)
    const longLivedResponse = await fetch(`https://graph.threads.net/access_token?grant_type=th_exchange_token&client_secret=${appSecret}&access_token=${accessToken}`);
    const longLivedData = await longLivedResponse.json();

    if (longLivedResponse.ok && longLivedData.access_token) {
      accessToken = longLivedData.access_token;
    }

    // 3. Fetch user profile to get username
    const profileResponse = await fetch(`https://graph.threads.net/v1.0/me?fields=id,username,name,threads_profile_picture_url&access_token=${accessToken}`);
    const profileData = await profileResponse.json();

    if (!profileResponse.ok) {
      console.error("Threads profile error:", profileData);
      return NextResponse.redirect(`${new URL(request.url).origin}/dashboard?error=threads_profile_failed`);
    }

    // 4. Save to database
    // We need the brand name
    const { data: brand } = await supabase.from('brands').select('name').eq('id', brandId).single();

    const { error: insertError } = await supabase
      .from('social_accounts')
      .upsert({
        user_id: user.id,
        brand_id: brandId,
        brand_name: brand?.name || "Unknown Brand",
        network: 'Threads',
        account_handle: profileData.username,
        access_token: accessToken,
        refresh_token: null, // Threads uses long-lived tokens instead
        token_expires_at: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(), // 60 days approx
      }, { onConflict: 'user_id,brand_id,network,account_handle' });

    if (insertError) {
      console.error("Supabase insert error:", insertError);
      return NextResponse.redirect(`${new URL(request.url).origin}/dashboard?error=database_error`);
    }

    // Redirect back to dashboard indicating success
    return NextResponse.redirect(`${new URL(request.url).origin}/dashboard?network=Threads&account=${profileData.username}`);
  } catch (err) {
    console.error("Threads callback exception:", err);
    return NextResponse.redirect(`${new URL(request.url).origin}/dashboard?error=server_error`);
  }
}
