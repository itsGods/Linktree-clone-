import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'
import { Profile } from '@/types/profile'
import { Theme } from '@/types/theme'

export const getProfileByUsername = cache(async (username: string) => {
  const supabase = await createClient()
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('*, themes(*)')
    .eq('username', username)
    .single()

  return profile as (Profile & { themes: Theme | null }) | null
})
