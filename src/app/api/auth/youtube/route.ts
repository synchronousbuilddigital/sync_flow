import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const brandId = searchParams.get("brandId");

  if (!brandId) {
    return NextResponse.json({ error: "Missing brandId" }, { status: 400 });
  }

  const clientId = process.env.YOUTUBE_CLIENT_ID;
  if (!clientId) {
    return NextResponse.json({ error: "YouTube Client ID not configured" }, { status: 500 });
  }

  // The base URL of our app, e.g., http://localhost:3000
  const origin = new URL(request.url).origin;
  const redirectUri = `${origin}/api/auth/youtube/callback`;

  // We pass the brandId in the state parameter so we know which brand to link the account to when Google redirects back
  const state = Buffer.from(JSON.stringify({ brandId })).toString('base64');

  const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  authUrl.searchParams.append("client_id", clientId);
  authUrl.searchParams.append("redirect_uri", redirectUri);
  authUrl.searchParams.append("response_type", "code");
  authUrl.searchParams.append("scope", "https://www.googleapis.com/auth/youtube.upload https://www.googleapis.com/auth/youtube.readonly https://www.googleapis.com/auth/yt-analytics.readonly");
  authUrl.searchParams.append("access_type", "offline");
  authUrl.searchParams.append("prompt", "consent"); // Force consent to ensure we get a refresh token
  authUrl.searchParams.append("state", state);

  return NextResponse.redirect(authUrl.toString());
}
