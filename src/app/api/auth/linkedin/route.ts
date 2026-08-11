import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const brandId = searchParams.get('brandId');

  if (!brandId) {
    return NextResponse.json({ error: "Brand ID is required" }, { status: 400 });
  }

  const clientId = process.env.LINKEDIN_CLIENT_ID;
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/linkedin/callback`;

  if (!clientId) {
    return NextResponse.json({ error: "LinkedIn Client ID is missing" }, { status: 500 });
  }

  const authUrl = new URL("https://www.linkedin.com/oauth/v2/authorization");
  authUrl.searchParams.append("response_type", "code");
  authUrl.searchParams.append("client_id", clientId);
  authUrl.searchParams.append("redirect_uri", redirectUri);
  authUrl.searchParams.append("state", brandId);
  authUrl.searchParams.append("scope", "openid profile email w_member_social");

  return NextResponse.redirect(authUrl.toString());
}
