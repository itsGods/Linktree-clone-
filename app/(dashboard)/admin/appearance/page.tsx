import { createClient } from "@/lib/supabase/server"
import { getThemes } from "@/server/actions/appearance"
import { AppearanceEditor } from "@/components/appearance/appearance-editor"
import { Theme } from "@/types/theme"

export default async function AppearancePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  // Fetch current profile appearance
  const { data: profile } = await supabase
    .from('profiles')
    .select('theme_id, custom_appearance, themes(*), username, display_name, bio, avatar_url, updated_at')
    .eq('id', user.id)
    .single()

  // Fetch system themes
  const systemThemes = await getThemes()

  const currentTheme = profile?.themes as unknown as Theme | null
  const customAppearance = profile?.custom_appearance as Partial<Theme> | null
  
  const profileData = {
    username: profile?.username,
    display_name: profile?.display_name,
    bio: profile?.bio,
    avatar_url: profile?.avatar_url,
    updated_at: profile?.updated_at
  }

  return (
    <AppearanceEditor 
      initialTheme={currentTheme}
      initialCustom={customAppearance}
      initialProfile={profileData}
      systemThemes={systemThemes}
    />
  )
}
