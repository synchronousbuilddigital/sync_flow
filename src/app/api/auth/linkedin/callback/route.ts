import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const brandId = searchParams.get('state');

  if (!code || !brandId) {
    return NextResponse.json({ error: "Missing code or state" }, { status: 400 });
  }

  const clientId = process.env.LINKEDIN_CLIENT_ID;
  const clientSecret = process.env.LINKEDIN_CLIENT_SECRET;
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/linkedin/callback`;

  if (!clientId || !clientSecret) {
    return NextResponse.json({ error: "LinkedIn credentials missing" }, { status: 500 });
  }

  try {
    // 1. Exchange code for access token
    const tokenParams = new URLSearchParams();
    tokenParams.append("grant_type", "authorization_code");
    tokenParams.append("code", code);
    tokenParams.append("redirect_uri", redirectUri);
    tokenParams.append("client_id", clientId);
    tokenParams.append("client_secret", clientSecret);

    const tokenRes = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: tokenParams,
    });

    const tokenData = await tokenRes.json();

    if (!tokenRes.ok || !tokenData.access_token) {
      console.error("LinkedIn Token Error:", tokenData);
      return NextResponse.json({ error: "Failed to get access token", details: tokenData }, { status: 500 });
    }

    const accessToken = tokenData.access_token;
    // Note: LinkedIn OpenID Connect tokens typically have 'expires_in'

    // 2. Fetch User Profile
    // Using OpenID Connect endpoint for userinfo
    const profileRes = await fetch("https://api.linkedin.com/v2/userinfo", {
      headers: {
        "Authorization": `Bearer ${accessToken}`,
      }
    });

    const profileData = await profileRes.json();

    if (!profileRes.ok || !profileData.sub) {
      console.error("LinkedIn Profile Error:", profileData);
      return NextResponse.json({ error: "Failed to fetch user profile", details: profileData }, { status: 500 });
    }

    // The 'sub' field in OIDC is the user's unique URN id
    const urn = `urn:li:person:${profileData.sub}`;
    // If you want just the name
    const handle = profileData.name || profileData.given_name || profileData.sub;
    // For profile picture, we can grab 'picture' from profileData
    const picture = profileData.picture;

    // 3. Save to Supabase
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/login`);
    }

    // Fetch brand to get its name (optional, but good for completeness)
    const { data: brand } = await supabase
      .from('brands')
      .select('name')
      .eq('id', brandId)
      .single();

    // Check if account already exists to avoid missing unique constraint errors
    const { data: existingAccount } = await supabase
      .from('social_accounts')
      .select('id')
      .eq('user_id', user.id)
      .eq('brand_id', brandId)
      .eq('network', 'LinkedIn')
      .eq('account_handle', handle)
      .maybeSingle();

    let upsertError;

    if (existingAccount) {
      const { error } = await supabase
        .from('social_accounts')
        .update({
          brand_name: brand?.name || 'Unknown Brand',
          access_token: accessToken,
          refresh_token: urn
        })
        .eq('id', existingAccount.id);
      upsertError = error;
    } else {
      const { error } = await supabase
        .from('social_accounts')
        .insert([{
          user_id: user.id,
          brand_id: brandId,
          brand_name: brand?.name || 'Unknown Brand',
          network: 'LinkedIn',
          account_handle: handle,
          access_token: accessToken,
          refresh_token: urn
        }]);
      upsertError = error;
    }

    if (upsertError) {
      console.error("Supabase Error:", upsertError);
      return NextResponse.json({ error: "Failed to save account" }, { status: 500 });
    }

    // Success! Redirect back to dashboard
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard?network=LinkedIn&account=${encodeURIComponent(handle)}`);

  } catch (err: any) {
    console.error("LinkedIn Callback Exception:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
