import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const brandId = searchParams.get('brandId');

  if (!brandId) {
    return NextResponse.json({ error: "Missing brandId" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const appId = process.env.INSTAGRAM_CLIENT_ID || process.env.FACEBOOK_APP_ID;
  const redirectUri = `${new URL(request.url).origin}/api/auth/instagram/callback`;
  
  if (!appId) {
    return NextResponse.json({ error: "INSTAGRAM_CLIENT_ID is not configured" }, { status: 500 });
  }

  const state = brandId;

  // Instagram Login for Business scopes
  const scopes = [
    'instagram_business_basic',
    'instagram_business_manage_messages',
    'instagram_business_manage_comments',
    'instagram_business_content_publish',
    'instagram_business_manage_insights'
  ].join(',');

  // Using www.instagram.com for direct Instagram Login!
  const authUrl = `https://www.instagram.com/oauth/authorize?enable_fb_login=0&force_authentication=1&client_id=${appId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${scopes}&state=${state}`;

  return NextResponse.redirect(authUrl);
}
