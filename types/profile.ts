import { Theme } from './theme'

export interface Profile {
  id: string
  username: string
  display_name: string | null
  bio: string | null
  avatar_url: string | null
  seo_title: string | null
  seo_description: string | null
  og_image_url: string | null
  og_template_style: 'default' | 'minimal' | 'dark' | 'gradient' | 'glass'
  custom_appearance: Partial<Theme> | null
  onboarding_complete: boolean
  updated_at: string
}
