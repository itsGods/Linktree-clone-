import { createClient } from "@/lib/supabase/server"
import { Link } from "@/types/links"

export async function getLinksByProfileId(profileId: string) {
  const supabase = await createClient()
  
  const { data: links, error } = await supabase
    .from('links')
    .select('*')
    .eq('profile_id', profileId)
    .order('position', { ascending: true })

  if (error) {
    throw new Error(error.message)
  }

  return links as Link[]
}

export async function getPublicLinksByUsername(username: string) {
  const supabase = await createClient()
  
  // First get the profile to get the ID
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('username', username)
    .single()

  if (!profile) return []

  // Then get the public links
  // The RLS policy "Public links are viewable by everyone" will handle the filtering
  // of is_active and scheduling.
  const { data: links, error } = await supabase
    .from('links')
    .select('*')
    .eq('profile_id', profile.id)
    .order('position', { ascending: true })

  if (error) {
    console.error("Error fetching public links:", error)
    return []
  }

  return links as Link[]
}
