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

  // Meta Threads OAuth URL
  const appId = process.env.THREADS_APP_ID;
  const redirectUri = `${new URL(request.url).origin}/api/auth/threads/callback`;
  
  if (!appId) {
    return NextResponse.json({ error: "THREADS_APP_ID is not configured in .env.local" }, { status: 500 });
  }

  // Store brandId in state to retrieve in callback
  const state = brandId;

  const authUrl = `https://threads.net/oauth/authorize?client_id=${appId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=threads_basic,threads_content_publish,threads_manage_insights,threads_read_replies&response_type=code&state=${state}`;

  return NextResponse.redirect(authUrl);
}
