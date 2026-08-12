import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { deleteCloudinaryMedia } from "@/app/actions/cloudinary";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  try {
    let supabase: any = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const body = await request.json();
    const { brandId, accountHandle, content, mediaUrl, userId: cronUserId, postType } = body;

    let actualUserId = user?.id;
    const authHeader = request.headers.get("Authorization");
    if (!actualUserId && authHeader === `Bearer ${process.env.CRON_SECRET}`) {
      actualUserId = cronUserId;
      supabase = createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );
    }

    if (!actualUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!brandId || !content || !accountHandle) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Fetch the Facebook Page details for this brand
    const { data: account, error: accError } = await supabase
      .from('social_accounts')
      .select('*')
      .eq('user_id', actualUserId)
      .eq('brand_id', brandId)
      .eq('network', 'Facebook')
      .eq('account_handle', accountHandle)
      .limit(1)
      .single();

    if (accError || !account || !account.access_token || !account.refresh_token) {
      return NextResponse.json({ error: "Facebook account not connected or missing ID" }, { status: 404 });
    }

    const pageAccessToken = account.access_token;
    const pageId = account.refresh_token; // We stored the FB Page ID here

    let apiUrl = `https://graph.facebook.com/v17.0/${pageId}/feed`;
    const params = new URLSearchParams();
    params.append('access_token', pageAccessToken);

    if (mediaUrl) {
      const isVideo = mediaUrl.match(/\.(mp4|mov)$/i);
      
      if (isVideo) {
        apiUrl = `https://graph.facebook.com/v17.0/${pageId}/videos`;
        params.append('file_url', mediaUrl);
        params.append('description', content);
      } else {
        apiUrl = `https://graph.facebook.com/v17.0/${pageId}/photos`;
        params.append('url', mediaUrl);
        params.append('caption', content);
      }
    } else {
      // Text-only post
      params.append('message', content);
    }

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params,
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Facebook publish error:", data);
      return NextResponse.json({ error: data.error?.message || "Failed to publish post to Facebook" }, { status: 500 });
    }

    // Delete temporary file from Cloudinary if media was used
    if (data.id && mediaUrl) {
      deleteCloudinaryMedia(mediaUrl).catch(err => console.error("Cloudinary async delete error:", err));
    }

    return NextResponse.json({ success: true, postId: data.id });
  } catch (error: any) {
    console.error("Facebook upload error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
