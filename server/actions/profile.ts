"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { ProfileInput } from "@/lib/validators/profile"
import { Profile } from "@/types/profile"

export async function updateProfile(input: Partial<ProfileInput>) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) throw new Error("Unauthorized")

  const { data, error } = await supabase
    .from('profiles')
    .update(input)
    .eq('id', user.id)
    .select()
    .single()

  if (error) throw new Error(error.message)

  revalidatePath('/settings')
  revalidatePath(`/${data.username}`)
  
  return data as Profile
}

export async function checkUsernameAvailability(username: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('profiles')
    .select('id')
    .eq('username', username)
    .single()

  if (error && error.code !== 'PGRST116') {
    // PGRST116 means no rows returned, which is good (username available)
    throw new Error(error.message)
  }

  return !data // true if available, false if taken
}

export async function getProfile() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (error) return null

  return data as Profile
}
