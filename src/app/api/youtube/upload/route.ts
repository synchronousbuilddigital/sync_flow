import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { google } from "googleapis";
import { Readable } from "stream";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { brandId, accountHandle, title, description, mediaUrl } = body;

    if (!brandId || !title || !mediaUrl || !accountHandle) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Fetch the specific YouTube account details for this brand
    const { data: account, error: accError } = await supabase
      .from('social_accounts')
      .select('*')
      .eq('user_id', user.id)
      .eq('brand_id', brandId)
      .eq('network', 'YouTube')
      .eq('account_handle', accountHandle)
      .limit(1)
      .single();

    if (accError || !account) {
      return NextResponse.json({ error: "YouTube account not connected for this brand" }, { status: 404 });
    }

    const oauth2Client = new google.auth.OAuth2(
      process.env.YOUTUBE_CLIENT_ID,
      process.env.YOUTUBE_CLIENT_SECRET,
      `${new URL(request.url).origin}/api/auth/youtube/callback`
    );

    oauth2Client.setCredentials({
      access_token: account.access_token,
      refresh_token: account.refresh_token,
    });

    // Automatically save new tokens to Supabase if Google refreshes them
    oauth2Client.on('tokens', async (tokens) => {
      const updates: any = {};
      if (tokens.access_token) updates.access_token = tokens.access_token;
      if (tokens.refresh_token) updates.refresh_token = tokens.refresh_token;
      if (tokens.expiry_date) {
        updates.token_expires_at = new Date(tokens.expiry_date).toISOString();
      }

      await supabase
        .from('social_accounts')
        .update(updates)
        .eq('id', account.id);
    });

    const youtube = google.youtube({
      version: "v3",
      auth: oauth2Client,
    });

    // Fetch the video from Cloudinary as a stream
    const videoResponse = await fetch(mediaUrl);
    if (!videoResponse.ok || !videoResponse.body) {
      return NextResponse.json({ error: "Failed to fetch media from Cloudinary" }, { status: 500 });
    }

    // Convert Web ReadableStream to Node.js Readable stream
    const nodeStream = Readable.fromWeb(videoResponse.body as any);

    // Upload to YouTube
    const res = await youtube.videos.insert({
      part: ["snippet", "status"],
      requestBody: {
        snippet: {
          title: title,
          description: description || "",
          // categoryId: "22", // People & Blogs
        },
        status: {
          privacyStatus: "private", // Default to private for safety, users can change it later
          selfDeclaredMadeForKids: false,
        },
      },
      media: {
        body: nodeStream,
      },
    });

    return NextResponse.json({ success: true, videoId: res.data.id });

  } catch (err: any) {
    console.error("YouTube Upload Error:", err);
    return NextResponse.json({ error: err.message || "Failed to upload to YouTube" }, { status: 500 });
  }
}
