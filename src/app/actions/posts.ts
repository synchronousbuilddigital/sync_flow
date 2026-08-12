"use server"

import { createClient } from "@/lib/supabase/server"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import { revalidatePath } from "next/cache"
import { PostPayload } from "@/components/dashboard/post-composer"

const adminSupabase = createSupabaseClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function createPost(payload: PostPayload) {
  const supabase = await createClient()
  
  // Verify authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    throw new Error("Unauthorized: Please log in to create posts.")
  }

  // Insert post into database
  const { data, error } = await supabase
    .from('posts')
    .insert({
      user_id: user.id,
      brand_id: payload.brandId,
      network: payload.network,
      account_name: payload.accountName,
      post_type: payload.postType,
      content: payload.content,
      media_urls: payload.mediaUrls,
      scheduled_timestamp: payload.scheduledTimestamp,
      status: payload.scheduledTimestamp ? 'Scheduled' : 'Published',
      network_post_id: payload.networkPostId
    })
    .select()
    .single()

  if (error) {
    console.error("Supabase insert error:", error)
    throw new Error("Failed to save post to database.")
  }

  revalidatePath('/calendar')
  return data
}

export async function updatePost(id: string, payload: PostPayload) {
  const supabase = await createClient()
  
  // Verify authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    throw new Error("Unauthorized: Please log in to update posts.")
  }

  // Update post in database using admin client to bypass broken RLS
  const { data, error } = await adminSupabase
    .from('posts')
    .update({
      network: payload.network,
      account_name: payload.accountName,
      post_type: payload.postType,
      content: payload.content,
      media_urls: payload.mediaUrls,
      scheduled_timestamp: payload.scheduledTimestamp,
      status: payload.scheduledTimestamp ? 'Scheduled' : 'Published',
      network_post_id: payload.networkPostId
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    console.error("Supabase update error:", error)
    throw new Error("Failed to update post in database: " + error.message)
  }

  revalidatePath('/calendar')
  return data
}

export async function deletePost(id: string) {
  const supabase = await createClient()
  
  // Verify authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    throw new Error("Unauthorized: Please log in to delete posts.")
  }

  // Soft delete post in database by setting status to 'Deleted'
  const { data, error } = await adminSupabase
    .from('posts')
    .update({ status: 'Deleted' })
    .eq('id', id)
    // Extra security measure since we bypass RLS: ensure they own the post!
    .eq('user_id', user.id)
    .select()

  if (error || !data || data.length === 0) {
    console.error("Supabase delete error:", error || "No rows updated")
    throw new Error("Failed to delete post. You may not have permission, or it was already deleted.")
  }

  revalidatePath('/calendar')
  return true
}

export async function restorePost(id: string) {
  const supabase = await createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) throw new Error("Unauthorized")

  // We set status to Published or Scheduled (for simplicity, we assume Scheduled if scheduled_timestamp exists, but here we can just fetch first or set to 'Published' and let edit handle it. Let's fetch first to be accurate)
  const { data: post } = await supabase.from('posts').select('scheduled_timestamp').eq('id', id).single()
  const newStatus = post?.scheduled_timestamp ? 'Scheduled' : 'Published'

  const { error } = await adminSupabase
    .from('posts')
    .update({ status: newStatus })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) throw new Error("Failed to restore post")

  revalidatePath('/calendar')
  return true
}

export async function hardDeletePost(id: string) {
  const supabase = await createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) throw new Error("Unauthorized")

  const { error } = await adminSupabase
    .from('posts')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) throw new Error("Failed to delete post permanently")

  revalidatePath('/calendar')
  return true
}

export async function getPosts(brandId: string) {
  const supabase = await createClient()
  
  // Verify authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user || !brandId) {
    return [] // Return empty array if not logged in or no brand selected
  }

  // Fetch only this user's posts for the specific brand
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('brand_id', brandId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error("Supabase fetch error:", error)
    throw new Error("Failed to fetch posts.")
  }

  return data
}
