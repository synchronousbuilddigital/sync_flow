"use server";

import { createClient } from "@/lib/supabase/server";

export interface ThreadPost {
  id: string;
  text: string;
  media_product_type?: string;
  media_url?: string;
  permalink: string;
  timestamp: string;
  likes: number;
  replies: number;
  views: number;
  comments: ThreadComment[];
}

export interface ThreadComment {
  id: string;
  text: string;
  timestamp: string;
  username: string;
}

export async function getThreadsContent(accountId: string): Promise<{ posts: ThreadPost[], error?: string }> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { posts: [], error: "Unauthorized" };
    }

    const { data: account } = await supabase
      .from('social_accounts')
      .select('*')
      .eq('id', accountId)
      .eq('user_id', user.id)
      .single();

    if (!account || account.network !== 'Threads') {
      return { posts: [], error: "Account not found or not a Threads account" };
    }

    const accessToken = account.access_token;

    // 1. Fetch user's threads
    const threadsRes = await fetch(`https://graph.threads.net/v1.0/me/threads?fields=id,text,media_product_type,media_url,permalink,timestamp&access_token=${accessToken}`);
    const threadsData = await threadsRes.json();

    if (threadsData.error) {
      return { posts: [], error: threadsData.error.message };
    }

    if (!threadsData.data || threadsData.data.length === 0) {
      return { posts: [] };
    }

    const recentThreads = threadsData.data.slice(0, 10); // get up to 10 recent threads
    const posts: ThreadPost[] = [];

    // 2. For each thread, fetch insights and replies
    for (const thread of recentThreads) {
      // Fetch insights
      const metricRes = await fetch(`https://graph.threads.net/v1.0/${thread.id}/threads_insights?metric=views,likes,replies,reposts,quotes&access_token=${accessToken}`);
      const metricData = await metricRes.json();
      
      let threadLikes = 0;
      let threadReplies = 0;
      let threadViews = 0;
      
      if (metricData.data) {
        metricData.data.forEach((m: any) => {
           if (m.name === 'likes') threadLikes = m.values?.[0]?.value || 0;
           if (m.name === 'replies') threadReplies = m.values?.[0]?.value || 0;
           if (m.name === 'views') threadViews = m.values?.[0]?.value || 0;
        });
      }

      // Fetch replies (comments)
      let comments: ThreadComment[] = [];
      try {
        const repliesRes = await fetch(`https://graph.threads.net/v1.0/${thread.id}/replies?fields=id,text,timestamp,username&access_token=${accessToken}`);
        const repliesData = await repliesRes.json();
        
        if (repliesData.data) {
          comments = repliesData.data.map((c: any) => ({
             id: c.id,
             text: c.text,
             timestamp: c.timestamp,
             username: c.username || "Unknown user"
          }));
        }
      } catch (err) {
        console.error(`Failed to fetch replies for thread ${thread.id}`, err);
      }

      posts.push({
        id: thread.id,
        text: thread.text || "",
        media_product_type: thread.media_product_type,
        media_url: thread.media_url,
        permalink: thread.permalink,
        timestamp: thread.timestamp,
        likes: threadLikes,
        replies: threadReplies,
        views: threadViews,
        comments
      });
    }

    return { posts };

  } catch (err: any) {
    console.error("Content API Error:", err);
    return { posts: [], error: err.message || "An unexpected error occurred" };
  }
}
