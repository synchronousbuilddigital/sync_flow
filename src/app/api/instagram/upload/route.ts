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

    if (!mediaUrl) {
      return NextResponse.json({ error: "Instagram requires an image or video to publish." }, { status: 400 });
    }

    // Fetch the Instagram account details for this brand
    const { data: account, error: accError } = await supabase
      .from('social_accounts')
      .select('*')
      .eq('user_id', actualUserId)
      .eq('brand_id', brandId)
      .eq('network', 'Instagram')
      .eq('account_handle', accountHandle)
      .limit(1)
      .single();

    if (accError || !account || !account.access_token || !account.refresh_token) {
      return NextResponse.json({ error: "Instagram account not connected or missing ID" }, { status: 404 });
    }

    const accessToken = account.access_token;
    const instagramAccountId = account.refresh_token; // We stored the IG Account ID here

    // Step 1: Create Media Container
    const isVideo = mediaUrl.match(/\.(mp4|mov)$/i);
    const containerParams = new URLSearchParams();
    
    // Stories do not support captions via the Graph API
    if (postType !== 'Story') {
      containerParams.append('caption', content);
    }
    
    if (postType === 'Reel') {
       containerParams.append('media_type', 'REELS');
       containerParams.append('video_url', mediaUrl);
    } else if (postType === 'Story') {
       containerParams.append('media_type', 'STORIES');
       if (isVideo) {
         containerParams.append('video_url', mediaUrl);
       } else {
         containerParams.append('image_url', mediaUrl);
       }
    } else {
       // Regular Post (Feed)
       if (isVideo) {
          // Instagram deprecated standard feed videos. All videos must be uploaded as Reels.
          containerParams.append('media_type', 'REELS'); 
          containerParams.append('video_url', mediaUrl);
       } else {
          // Regular image post does not require media_type
          containerParams.append('image_url', mediaUrl);
       }
    }
    
    containerParams.append('access_token', accessToken);

    const containerResponse = await fetch(`https://graph.facebook.com/v17.0/${instagramAccountId}/media`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: containerParams,
    });

    const containerData = await containerResponse.json();

    if (!containerResponse.ok) {
      console.error("Instagram container error:", containerData);
      return NextResponse.json({ error: containerData.error?.message || "Failed to create media container" }, { status: 500 });
    }

    const creationId = containerData.id;

    // Wait for video processing by polling the status (Meta recommends polling)
    if (isVideo) {
       let isReady = false;
       let attempts = 0;
       while (!isReady && attempts < 30) {
         await new Promise(resolve => setTimeout(resolve, 3000)); // wait 3 seconds
         const statusResponse = await fetch(`https://graph.facebook.com/v17.0/${creationId}?fields=status_code&access_token=${accessToken}`);
         const statusData = await statusResponse.json();
         console.log(`[Instagram Upload] Processing attempt ${attempts + 1}: status = ${statusData.status_code}`);
         if (statusData.status_code === 'FINISHED') {
           isReady = true;
         } else if (statusData.status_code === 'ERROR') {
           console.error("Instagram video processing error:", statusData);
           return NextResponse.json({ error: "Instagram failed to process the video." }, { status: 500 });
         }
         attempts++;
       }
       if (!isReady) {
         return NextResponse.json({ error: "Instagram is taking too long to process the video. Try a shorter video." }, { status: 500 });
       }
    }

    // Step 2: Publish the Container
    const publishParams = new URLSearchParams();
    publishParams.append('creation_id', creationId);
    publishParams.append('access_token', accessToken);

    const publishResponse = await fetch(`https://graph.facebook.com/v17.0/${instagramAccountId}/media_publish`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: publishParams,
    });

    const publishData = await publishResponse.json();

    if (!publishResponse.ok) {
      console.error("Instagram publish error:", publishData);
      return NextResponse.json({ error: publishData.error?.message || "Failed to publish post" }, { status: 500 });
    }

    // Delete temporary file from Cloudinary since it is now natively hosted on Instagram
    if (publishData.id && mediaUrl) {
      deleteCloudinaryMedia(mediaUrl).catch(err => console.error("Cloudinary async delete error:", err));
    }

    return NextResponse.json({ success: true, postId: publishData.id });
  } catch (error: any) {
    console.error("Instagram upload error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
