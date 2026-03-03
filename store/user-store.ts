import { create } from 'zustand'
import { createClient } from '@/lib/supabase/client'

interface UserState {
  user: any | null
  profile: any | null
  isLoading: boolean
  fetchUser: () => Promise<void>
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  profile: null,
  isLoading: true,
  fetchUser: async () => {
    set({ isLoading: true })
    const supabase = createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      
      set({ user, profile, isLoading: false })
    } else {
      set({ user: null, profile: null, isLoading: false })
    }
  },
}))
