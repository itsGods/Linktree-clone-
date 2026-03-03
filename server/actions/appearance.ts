"use server"

import { createClient } from "@/lib/supabase/server"
import { Theme } from "@/types/theme"
import { Profile } from "@/types/profile"
import { revalidatePath } from "next/cache"

export async function getThemes() {
  const supabase = await createClient()
  
  const { data: themes, error } = await supabase
    .from('themes')
    .select('*')
    .or(`is_system.eq.true,created_by.eq.${(await supabase.auth.getUser()).data.user?.id}`)
    .order('is_system', { ascending: false }) // System themes first
    .order('name', { ascending: true })

  if (error) throw new Error(error.message)
  return themes as Theme[]
}

export async function updateProfileAppearance(
  themeId: string | null, 
  customAppearance: Partial<Theme>,
  profileData?: Partial<Profile>
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) throw new Error("Unauthorized")

  const updateData: any = {
    theme_id: themeId,
    custom_appearance: customAppearance,
    updated_at: new Date().toISOString()
  }

  if (profileData) {
    if (profileData.display_name !== undefined) updateData.display_name = profileData.display_name
    if (profileData.bio !== undefined) updateData.bio = profileData.bio
    if (profileData.avatar_url !== undefined) updateData.avatar_url = profileData.avatar_url
  }

  const { error } = await supabase
    .from('profiles')
    .update(updateData)
    .eq('id', user.id)

  if (error) throw new Error(error.message)

  revalidatePath('/admin/appearance')
  revalidatePath(`/${user.id}`) // Revalidate public profile
}
