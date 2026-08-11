import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(request: Request) {
  try {
    // 1. Verify Authentication
    const authHeader = request.headers.get("Authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Initialize Supabase with Service Role to bypass RLS
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 3. Find all posts scheduled for now or in the past
    const now = new Date().toISOString();
    const { data: posts, error: fetchError } = await supabase
      .from("posts")
      .select("*")
      .eq("status", "Scheduled")
      .lte("scheduled_timestamp", now);

    if (fetchError) {
      console.error("Cron fetch error:", fetchError);
      return NextResponse.json({ error: "Failed to fetch scheduled posts" }, { status: 500 });
    }

    if (!posts || posts.length === 0) {
      return NextResponse.json({ message: "No scheduled posts to publish." });
    }

    const results = [];

    // 4. Process each post
    for (const post of posts) {
      try {
        const network = post.network.toLowerCase();
        const endpoint = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/${network}/upload`;
        
        const mediaUrl = post.media_urls && post.media_urls.length > 0 ? post.media_urls[0] : null;

        // Note: For YouTube we need title and description. We fallback to content if not specified perfectly.
        const title = post.content.split('\n')[0].substring(0, 50) || "SyncFlow Post";
        
        const payload = {
          userId: post.user_id,
          brandId: post.brand_id,
          accountHandle: post.account_name,
          content: post.content,
          title: title,
          description: post.content,
          mediaUrl: mediaUrl
        };

        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${process.env.CRON_SECRET}`
          },
          body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(JSON.stringify(result));
        }

        const networkPostId = result.videoId || result.threadId || result.postId;

        // 5. Mark as Published and clean up the Cloudinary URL
        const { error: updateError } = await supabase
          .from("posts")
          .update({
            status: "Published",
            network_post_id: networkPostId,
            media_urls: [] // Clear Cloudinary URL
          })
          .eq("id", post.id);

        if (updateError) {
          console.error(`Failed to update post ${post.id} to Published:`, updateError);
          results.push({ id: post.id, success: false, error: "Database update failed" });
        } else {
          results.push({ id: post.id, success: true, networkPostId });
        }

      } catch (err: any) {
        console.error(`Error processing post ${post.id}:`, err);
        results.push({ id: post.id, success: false, error: err.message });
      }
    }

    return NextResponse.json({ success: true, processed: results.length, results });

  } catch (error: any) {
    console.error("Cron Job Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
