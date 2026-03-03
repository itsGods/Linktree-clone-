import { create } from 'zustand'
import { Theme, ProfileAppearance } from '@/types/theme'
import { Profile } from '@/types/profile'
import { resolveTheme, DEFAULT_THEME } from '@/lib/theme/resolve-theme'
import { updateProfileAppearance } from '@/server/actions/appearance'
import { toast } from 'sonner'

interface AppearanceState {
  // The base theme selected from the gallery
  selectedTheme: Theme | null
  // The custom overrides (unsaved or saved)
  customAppearance: Partial<Theme>
  // The final resolved theme for preview
  previewTheme: Theme
  // Profile details
  profile: Partial<Profile> | null
  
  // Actions
  init: (theme: Theme | null, custom: Partial<Theme> | null, profile: Partial<Profile> | null) => void
  setTheme: (theme: Theme) => void
  updateCustom: (updates: Partial<Theme>) => void
  updateProfile: (updates: Partial<Profile>) => void
  save: () => Promise<void>
  reset: () => void
  isDirty: boolean
}

export const useAppearanceStore = create<AppearanceState>((set, get) => ({
  selectedTheme: null,
  customAppearance: {},
  previewTheme: DEFAULT_THEME,
  profile: null,
  isDirty: false,

  init: (theme, custom, profile) => {
    set({
      selectedTheme: theme,
      customAppearance: custom || {},
      previewTheme: resolveTheme(theme, custom || {}),
      profile: profile || {},
      isDirty: false
    })
  },

  setTheme: (theme) => {
    // When selecting a new system theme, we might want to clear custom overrides 
    // or keep them. Usually, selecting a preset clears overrides unless specific logic.
    // Let's clear overrides for a "fresh start" feeling, but maybe keep content-agnostic ones?
    // For simplicity: clear overrides.
    set({
      selectedTheme: theme,
      customAppearance: {},
      previewTheme: resolveTheme(theme, {}),
      isDirty: true
    })
  },

  updateCustom: (updates) => {
    const currentCustom = get().customAppearance
    const newCustom = { ...currentCustom, ...updates }
    
    set({
      customAppearance: newCustom,
      previewTheme: resolveTheme(get().selectedTheme, newCustom),
      isDirty: true
    })
  },

  updateProfile: (updates) => {
    const currentProfile = get().profile || {}
    set({
      profile: { ...currentProfile, ...updates },
      isDirty: true
    })
  },

  save: async () => {
    const { selectedTheme, customAppearance, profile } = get()
    try {
      await updateProfileAppearance(selectedTheme?.id || null, customAppearance, profile || undefined)
      set({ isDirty: false })
      toast.success("Appearance saved")
    } catch (error) {
      toast.error("Failed to save appearance")
    }
  },

  reset: () => {
    // Revert to initial state? 
    // For now, just reset to default
    set({
      selectedTheme: null,
      customAppearance: {},
      previewTheme: DEFAULT_THEME,
      isDirty: true
    })
  }
}))
