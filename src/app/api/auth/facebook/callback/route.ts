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
  const redirectUri = `${new URL(request.url).origin}/api/auth/facebook/callback`;
  const appId = process.env.FACEBOOK_APP_ID;
  const appSecret = process.env.FACEBOOK_APP_SECRET;

  if (!appId || !appSecret) {
    return NextResponse.json({ error: "FACEBOOK_APP_ID or FACEBOOK_APP_SECRET is not configured" }, { status: 500 });
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
      console.error("Facebook token error:", tokenData);
      return NextResponse.redirect(`${new URL(request.url).origin}/dashboard?error=facebook_auth_failed`);
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

    // Use the first page by default (user can configure later if needed)
    const facebookPage = pagesData.data[0];
    const pageId = facebookPage.id;
    const pageName = facebookPage.name;
    const pageAccessToken = facebookPage.access_token; // Crucial: This is what allows posting to the page!

    if (!pageId || !pageAccessToken) {
      return NextResponse.redirect(`${new URL(request.url).origin}/dashboard?error=invalid_page_data`);
    }

    // 4. Save to database
    const { data: brand } = await supabase.from('brands').select('name').eq('id', brandId).single();

    // Check if account already exists
    const { data: existingAccount } = await supabase
      .from('social_accounts')
      .select('id')
      .eq('user_id', user.id)
      .eq('network', 'Facebook')
      .eq('account_handle', pageName)
      .maybeSingle();

    let insertError;

    if (existingAccount) {
      const { error } = await supabase
        .from('social_accounts')
        .update({
          brand_id: brandId,
          brand_name: brand?.name || "Unknown Brand",
          access_token: pageAccessToken, // The token to post
          refresh_token: pageId, // The ID of the page
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
          network: 'Facebook',
          account_handle: pageName,
          access_token: pageAccessToken,
          refresh_token: pageId,
          token_expires_at: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
        }]);
      insertError = error;
    }

    if (insertError) {
      console.error("Supabase insert error:", insertError);
      return NextResponse.redirect(`${new URL(request.url).origin}/dashboard?error=database_error`);
    }

    // Redirect back to dashboard indicating success
    return NextResponse.redirect(`${new URL(request.url).origin}/dashboard?network=Facebook&account=${encodeURIComponent(pageName)}`);
  } catch (err) {
    console.error("Facebook callback exception:", err);
    return NextResponse.redirect(`${new URL(request.url).origin}/dashboard?error=server_error`);
  }
}
