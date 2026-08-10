import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { brandId, accountHandle, content, mediaUrl } = body;

    if (!brandId || !content || !accountHandle) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Fetch the Threads account details for this brand
    const { data: account, error: accError } = await supabase
      .from('social_accounts')
      .select('*')
      .eq('user_id', user.id)
      .eq('brand_id', brandId)
      .eq('network', 'Threads')
      .eq('account_handle', accountHandle)
      .limit(1)
      .single();

    if (accError || !account || !account.access_token) {
      return NextResponse.json({ error: "Threads account not connected for this brand" }, { status: 404 });
    }

    const accessToken = account.access_token;
    
    // First, fetch the actual numeric Threads User ID, because 'me' might fail on POST endpoints
    const meResponse = await fetch(`https://graph.threads.net/v1.0/me?access_token=${accessToken}`);
    const meData = await meResponse.json();
    
    if (!meResponse.ok) {
       console.error("Failed to get numeric ID:", meData);
       return NextResponse.json({ error: "Failed to verify Threads identity" }, { status: 500 });
    }
    
    const threadsUserId = meData.id;

    // Step 1: Create Media Container
    const containerParams = new URLSearchParams();
    containerParams.append('media_type', mediaUrl ? (mediaUrl.match(/\.(mp4|mov)$/i) ? 'VIDEO' : 'IMAGE') : 'TEXT');
    containerParams.append('text', content);
    
    if (mediaUrl) {
       if (mediaUrl.match(/\.(mp4|mov)$/i)) {
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
      return NextResponse.json({ error: containerData.error?.message || "Failed to create media container" }, { status: 500 });
    }

    const creationId = containerData.id;

    // Wait a brief moment for video processing if necessary (Meta recommends polling for status, but for simplicity we pause briefly)
    if (mediaUrl && mediaUrl.match(/\.(mp4|mov)$/i)) {
       await new Promise(resolve => setTimeout(resolve, 3000));
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
      return NextResponse.json({ error: publishData.error?.message || "Failed to publish thread" }, { status: 500 });
    }

    return NextResponse.json({ success: true, threadId: publishData.id });
  } catch (error: any) {
    console.error("Threads upload error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
