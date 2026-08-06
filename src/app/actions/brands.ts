"use server"

import { createClient } from "@/lib/supabase/server"

export type Brand = {
  id: string
  user_id: string
  name: string
  created_at: string
}

export async function getBrands(): Promise<Brand[] | null> {
  const supabase = await createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    console.error("Auth error fetching brands:", authError)
    return null
  }

  const { data, error } = await supabase
    .from('brands')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error("Supabase fetch brands error:", error)
    return null
  }

  return data as Brand[]
}

export async function createBrand(name: string) {
  const supabase = await createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    console.error("Auth error creating brand:", authError)
    return { success: false, error: "Unauthorized" }
  }

  const { data, error } = await supabase
    .from('brands')
    .insert([
      { 
        user_id: user.id,
        name: name,
      }
    ])
    .select()
    .single()

  if (error) {
    console.error("Supabase insert brand error:", error)
    return { success: false, error: error.message }
  }

  return { success: true, data }
}
