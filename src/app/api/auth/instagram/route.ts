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

  // Note: For Instagram Graph API, we actually log in via Facebook OAuth
  const appId = process.env.INSTAGRAM_CLIENT_ID || process.env.FACEBOOK_APP_ID;
  const redirectUri = `${new URL(request.url).origin}/api/auth/instagram/callback`;
  
  if (!appId) {
    return NextResponse.json({ error: "INSTAGRAM_CLIENT_ID is not configured in environment variables" }, { status: 500 });
  }

  // Store brandId in state to retrieve in callback
  const state = brandId;

  // We request permissions for both Facebook pages and Instagram graph API publishing
  const scopes = [
    'instagram_basic',
    'instagram_content_publish',
    'pages_show_list',
    'pages_read_engagement',
    'business_management'
  ].join(',');

  const authUrl = `https://www.facebook.com/v17.0/dialog/oauth?client_id=${appId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scopes}&response_type=code&state=${state}&auth_type=rerequest`;

  return NextResponse.redirect(authUrl);
}
