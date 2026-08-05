"use server"

import { createClient } from "@/lib/supabase/server"

export type SocialAccount = {
  id: string
  user_id: string
  network: string
  account_handle: string
  created_at: string
}

export async function getAccounts(): Promise<SocialAccount[] | null> {
  const supabase = await createClient()
  
  // Verify user is logged in
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    console.error("Auth error fetching accounts:", authError)
    return null
  }

  const { data, error } = await supabase
    .from('social_accounts')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error("Supabase fetch accounts error:", error)
    return null
  }

  return data as SocialAccount[]
}

export async function addAccount(network: string, accountHandle: string) {
  const supabase = await createClient()
  
  // Verify user is logged in
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    console.error("Auth error adding account:", authError)
    return { success: false, error: "Unauthorized" }
  }

  // Insert the account
  const { data, error } = await supabase
    .from('social_accounts')
    .insert([
      { 
        user_id: user.id,
        network: network,
        account_handle: accountHandle
      }
    ])
    .select()
    .single()

  if (error) {
    console.error("Supabase insert account error:", error)
    return { success: false, error: error.message }
  }

  return { success: true, data }
}
