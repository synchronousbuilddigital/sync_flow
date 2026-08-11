import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { deleteCloudinaryMedia } from "@/app/actions/cloudinary";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { brandId, accountHandle, content, mediaUrl, userId: cronUserId } = body;

    if (!brandId || !accountHandle || !content) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    let supabase: any = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
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

    const queryParams = { brandId, accountHandle, actualUserId };
    console.log("CRON DEBUG: Querying account with", queryParams);
    // Get the LinkedIn account
    const { data: account, error: accError } = await supabase
      .from('social_accounts')
      .select('*')
      .eq('brand_id', brandId)
      .eq('account_handle', accountHandle)
      .eq('user_id', actualUserId)
      .single();

    console.log("CRON DEBUG: Account result:", account, "Error:", accError);

    if (!account || account.network !== 'LinkedIn') {
      return NextResponse.json({ error: "LinkedIn account not found", details: queryParams, supabaseError: accError }, { status: 404 });
    }

    const accessToken = account.access_token;
    const authorUrn = account.refresh_token;

    if (!authorUrn) {
      return NextResponse.json({ error: "Author URN missing from account metadata" }, { status: 500 });
    }

    let assetUrn: string | null = null;

    if (mediaUrl) {
      const isVideo = mediaUrl.match(/\.(mp4|mov|webm)$/i);
      const recipe = isVideo ? "urn:li:digitalmediaRecipe:feedshare-video" : "urn:li:digitalmediaRecipe:feedshare-image";

      // 1. Register Upload
      const registerPayload = {
        registerUploadRequest: {
          recipes: [recipe],
          owner: authorUrn,
          serviceRelationships: [
            {
              relationshipType: "OWNER",
              identifier: "urn:li:userGeneratedContent"
            }
          ]
        }
      };

      const registerRes = await fetch("https://api.linkedin.com/v2/assets?action=registerUpload", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          "X-Restli-Protocol-Version": "2.0.0"
        },
        body: JSON.stringify(registerPayload)
      });
      
      const registerData = await registerRes.json();
      if (!registerRes.ok || !registerData.value) {
        console.error("LinkedIn Register Upload Error:", registerData);
        return NextResponse.json({ error: "Failed to register upload with LinkedIn" }, { status: 500 });
      }

      assetUrn = registerData.value.asset;
      const uploadUrl = registerData.value.uploadMechanism["com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest"].uploadUrl;

      // 2. Upload Binary Data to LinkedIn
      const mediaRes = await fetch(mediaUrl);
      if (!mediaRes.ok) {
        return NextResponse.json({ error: "Failed to fetch media from Cloudinary" }, { status: 500 });
      }
      
      const arrayBuffer = await mediaRes.arrayBuffer();

      const uploadRes = await fetch(uploadUrl, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/octet-stream"
        },
        body: arrayBuffer
      });

      if (!uploadRes.ok) {
        return NextResponse.json({ error: "Failed to upload media bytes to LinkedIn" }, { status: 500 });
      }
    }

    // Build the UGC Post payload
    const payload: any = {
      author: authorUrn,
      lifecycleState: "PUBLISHED",
      specificContent: {
        "com.linkedin.ugc.ShareContent": {
          shareCommentary: {
            text: content
          },
          shareMediaCategory: assetUrn ? (mediaUrl?.match(/\.(mp4|mov|webm)$/i) ? "VIDEO" : "IMAGE") : "NONE",
        }
      },
      visibility: {
        "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"
      }
    };

    if (assetUrn) {
      payload.specificContent["com.linkedin.ugc.ShareContent"].media = [
        {
          status: "READY",
          media: assetUrn
        }
      ];
    }

    // Publish to LinkedIn
    const liRes = await fetch("https://api.linkedin.com/v2/ugcPosts", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        "X-Restli-Protocol-Version": "2.0.0"
      },
      body: JSON.stringify(payload)
    });

    const liData = await liRes.json();

    if (!liRes.ok || liData.message || liData.error) {
      console.error("LinkedIn Post Error:", liData);
      return NextResponse.json({ error: liData.message || "Failed to post to LinkedIn" }, { status: 500 });
    }

    // Delete temporary file from Cloudinary since it is now natively hosted on LinkedIn
    if (liData.id && mediaUrl) {
      deleteCloudinaryMedia(mediaUrl).catch(err => console.error("Cloudinary async delete error:", err));
    }

    return NextResponse.json({ success: true, postId: liData.id });

  } catch (error: any) {
    console.error("LinkedIn Upload Route Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
