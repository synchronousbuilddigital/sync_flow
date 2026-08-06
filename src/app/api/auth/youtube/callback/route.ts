import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  const origin = new URL(request.url).origin;

  if (error) {
    return NextResponse.redirect(`${origin}/dashboard?error=youtube_auth_failed`);
  }

  if (!code || !state) {
    return NextResponse.redirect(`${origin}/dashboard?error=missing_parameters`);
  }

  try {
    const { brandId } = JSON.parse(Buffer.from(state, 'base64').toString('utf8'));

    const clientId = process.env.YOUTUBE_CLIENT_ID;
    const clientSecret = process.env.YOUTUBE_CLIENT_SECRET;
    const redirectUri = `${origin}/api/auth/youtube/callback`;

    // Exchange the auth code for access & refresh tokens
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        code,
        client_id: clientId!,
        client_secret: clientSecret!,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    const tokens = await tokenResponse.json();

    if (!tokenResponse.ok) {
      console.error("Failed to fetch tokens:", tokens);
      return NextResponse.redirect(`${origin}/dashboard?error=token_exchange_failed`);
    }

    const { access_token, refresh_token, expires_in } = tokens;

    // Fetch the user's YouTube channel info so we have an account_handle
    const profileResponse = await fetch("https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true", {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });
    const profileData = await profileResponse.json();
    
    let accountHandle = "YouTube Channel";
    if (profileData.items && profileData.items.length > 0) {
      accountHandle = profileData.items[0].snippet.title;
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.redirect(`${origin}/dashboard?error=unauthorized`);
    }

    const expiresAt = new Date(Date.now() + expires_in * 1000).toISOString();

    // Save or update the YouTube account in Supabase
    const { data: existingAccount } = await supabase
      .from('social_accounts')
      .select('id')
      .eq('user_id', user.id)
      .eq('network', 'YouTube')
      .eq('account_handle', accountHandle)
      .single();

    let dbError;
    if (existingAccount) {
      const { error } = await supabase
        .from('social_accounts')
        .update({
          brand_id: brandId,
          access_token: access_token,
          refresh_token: refresh_token || undefined,
          token_expires_at: expiresAt,
        })
        .eq('id', existingAccount.id);
      dbError = error;
    } else {
      const { error } = await supabase
        .from('social_accounts')
        .insert({
          user_id: user.id,
          brand_id: brandId,
          network: 'YouTube',
          account_handle: accountHandle,
          access_token: access_token,
          refresh_token: refresh_token || null,
          token_expires_at: expiresAt,
        });
      dbError = error;
    }

    if (dbError) {
      console.error("DB Save Error:", dbError);
      return NextResponse.redirect(`${origin}/dashboard?error=database_error`);
    }

    return NextResponse.redirect(`${origin}/dashboard?success=youtube_connected`);

  } catch (err) {
    console.error("YouTube OAuth Callback Error:", err);
    return NextResponse.redirect(`${origin}/dashboard?error=server_error`);
  }
}
