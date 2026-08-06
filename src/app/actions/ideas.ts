"use server"

import { createClient } from "@/lib/supabase/server"

export type Idea = {
  id: string
  user_id: string
  brand_id: string
  column_id: string
  title: string
  description?: string
  network?: string
  created_at: string
}

export async function getIdeas(brandId: string): Promise<Idea[] | null> {
  const supabase = await createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    console.error("Auth error fetching ideas:", authError)
    return null
  }

  const { data, error } = await supabase
    .from('ideas')
    .select('*')
    .eq('brand_id', brandId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error("Supabase fetch ideas error:", error)
    return null
  }

  return data as Idea[]
}

export async function addIdea(brandId: string, title: string, description?: string, network?: string) {
  const supabase = await createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    console.error("Auth error adding idea:", authError)
    return { success: false, error: "Unauthorized" }
  }

  const { data, error } = await supabase
    .from('ideas')
    .insert([
      { 
        user_id: user.id,
        brand_id: brandId,
        title,
        description,
        network,
        column_id: 'unassigned'
      }
    ])
    .select()
    .single()

  if (error) {
    console.error("Supabase insert idea error:", error)
    return { success: false, error: error.message }
  }

  return { success: true, data }
}

export async function updateIdeaColumn(ideaId: string, newColumnId: string) {
  const supabase = await createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { success: false, error: "Unauthorized" }
  }

  const { error } = await supabase
    .from('ideas')
    .update({ column_id: newColumnId })
    .eq('id', ideaId)
    .eq('user_id', user.id)

  if (error) {
    console.error("Supabase update idea error:", error)
    return { success: false, error: error.message }
  }

  return { success: true }
}
