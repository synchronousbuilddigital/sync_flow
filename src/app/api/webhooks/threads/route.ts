import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  
  // Meta sends these query parameters during the initial setup ping
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  // This is the custom token we will tell Meta to expect
  const VERIFY_TOKEN = "syncflow_secure_token";

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    // Meta requires us to respond with the exact challenge string they sent
    return new NextResponse(challenge, { 
      status: 200,
      headers: { 'Content-Type': 'text/plain' }
    });
  } else {
    // Respond with '403 Forbidden' if verify tokens do not match
    return new NextResponse("Forbidden", { status: 403 });
  }
}

export async function POST(request: Request) {
  // This is where we would handle incoming webhook data from Meta in the future (e.g. new comments)
  // For now, we just acknowledge we received it so Meta stays happy.
  return new NextResponse("EVENT_RECEIVED", { status: 200 });
}
