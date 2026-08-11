import { createClient } from "@/lib/supabase/server";
import { deleteCloudinaryMedia } from "@/app/actions/cloudinary";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    let supabase: any = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const body = await request.json();
    const { brandId, accountHandle, content, mediaUrl, userId: cronUserId } = body;

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

    // Fetch the Threads account details for this brand
    const { data: account, error: accError } = await supabase
      .from('social_accounts')
      .select('*')
      .eq('user_id', actualUserId)
      .eq('brand_id', brandId)
      .eq('network', 'Threads')
      .eq('account_handle', accountHandle)
      .limit(1)
      .single();

    if (accError || !account || !account.access_token) {
      return NextResponse.json({ error: "Threads account not connected for this brand" }, { status: 404 });
    }

    const accessToken = account.access_token;
    
    // First, fetch the actual numeric Threads User ID
    const meResponse = await fetch(`https://graph.threads.net/v1.0/me?fields=id&access_token=${accessToken}`);
    const meData = await meResponse.json();
    
    if (!meResponse.ok || !meData.id) {
       console.error("Failed to get numeric ID:", meData);
       return NextResponse.json({ error: `Identity fetch failed: ${JSON.stringify(meData)}` }, { status: 500 });
    }
    
    const threadsUserId = meData.id;

    // Step 1: Create Media Container
    const containerParams = new URLSearchParams();
    containerParams.append('media_type', mediaUrl ? (mediaUrl.match(/\.(mp4|mov|webm)$/i) ? 'VIDEO' : 'IMAGE') : 'TEXT');
    containerParams.append('text', content);
    
    if (mediaUrl) {
       if (mediaUrl.match(/\.(mp4|mov|webm)$/i)) {
          containerParams.append('video_url', mediaUrl);
       } else {
          containerParams.append('image_url', mediaUrl);
       }
    }
    
    containerParams.append('access_token', accessToken);

    const containerResponse = await fetch(`https://graph.threads.net/v1.0/${threadsUserId}/threads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: containerParams,
    });

    const containerData = await containerResponse.json();

    if (!containerResponse.ok) {
      console.error("Threads container error:", containerData);
      return NextResponse.json({ error: `Container Error: ${containerData.error?.message || JSON.stringify(containerData)}` }, { status: 500 });
    }

    const creationId = containerData.id;

    // Wait for video processing if necessary by polling status
    if (mediaUrl && mediaUrl.match(/\.(mp4|mov|webm)$/i)) {
       let isFinished = false;
       let attempts = 0;
       
       while (!isFinished && attempts < 10) {
         await new Promise(resolve => setTimeout(resolve, 3000)); // wait 3s between polls
         attempts++;
         
         const statusResponse = await fetch(`https://graph.threads.net/v1.0/${creationId}?fields=status,error_message&access_token=${accessToken}`);
         const statusData = await statusResponse.json();
         
         if (statusData.status === 'FINISHED') {
           isFinished = true;
         } else if (statusData.status === 'ERROR') {
           return NextResponse.json({ error: `Video processing failed: ${statusData.error_message}` }, { status: 500 });
         }
         // If IN_PROGRESS, continue looping
       }
       
       if (!isFinished) {
          return NextResponse.json({ error: "Video processing timed out on Meta's servers." }, { status: 500 });
       }
    }

    // Step 2: Publish the Container
    const publishParams = new URLSearchParams();
    publishParams.append('creation_id', creationId);
    publishParams.append('access_token', accessToken);

    const publishResponse = await fetch(`https://graph.threads.net/v1.0/${threadsUserId}/threads_publish`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: publishParams,
    });

    const publishData = await publishResponse.json();

    if (!publishResponse.ok) {
      console.error("Threads publish error:", publishData);
      return NextResponse.json({ error: `Publish Error: ${publishData.error?.message || JSON.stringify(publishData)}` }, { status: 500 });
    }

    // Delete temporary file from Cloudinary since it is now natively hosted on Threads
    if (publishData.id && mediaUrl) {
      deleteCloudinaryMedia(mediaUrl).catch(err => console.error("Cloudinary async delete error:", err));
    }

    return NextResponse.json({ success: true, threadId: publishData.id });
  } catch (error: any) {
    console.error("Threads upload error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
