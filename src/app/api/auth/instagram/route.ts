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

  // User specifically requested to use the legacy Instagram Basic Display API
  const appId = process.env.INSTAGRAM_CLIENT_ID || '1361463619453040';
  const redirectUri = `${new URL(request.url).origin}/api/auth/instagram/callback`;
  
  if (!appId) {
    return NextResponse.json({ error: "INSTAGRAM_CLIENT_ID is not configured in environment variables" }, { status: 500 });
  }

  // Store brandId in state to retrieve in callback
  const state = brandId;

  // We request permissions for Instagram Basic Display API
  const scopes = 'user_profile,user_media';

  const authUrl = `https://api.instagram.com/oauth/authorize?client_id=${appId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scopes}&response_type=code&state=${state}`;

  return NextResponse.redirect(authUrl);
}
