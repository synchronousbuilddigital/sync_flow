import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  
  // Meta sends these query parameters during the initial setup ping
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  // This is the custom token we will tell Meta to expect
  const VERIFY_TOKEN = "syncflow_instagram_secure_token";

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    // Meta requires us to respond with the exact challenge string they sent
    return new NextResponse(challenge, { 
      status: 200,
      headers: { 'Content-Type': 'text/plain' }
    });
  } else {
    return NextResponse.json({ error: "Invalid token or mode" }, { status: 403 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("Instagram Webhook received:", JSON.stringify(body, null, 2));

    // Handle Instagram webhook events here in the future
    // e.g. Comments, Mentions, Messages, etc.

    // Always return a 200 OK immediately so Meta doesn't retry
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error processing Instagram Webhook:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
