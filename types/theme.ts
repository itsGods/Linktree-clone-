export type BackgroundType = 'solid' | 'gradient' | 'image' | 'video' | 'animated'
export type CardStyle = 'fill' | 'outline' | 'soft_shadow' | 'hard_shadow' | 'glass'
export type AvatarShape = 'circle' | 'rounded' | 'square'
export type HoverAnimation = 'none' | 'scale' | 'lift' | 'glow' | 'fill'
export type SocialIconStyle = 'filled' | 'outline' | 'brand'

export interface Theme {
  id: string
  name: string
  is_premium: boolean
  is_system: boolean
  created_by?: string
  
  background_type: BackgroundType
  background_value: string | null
  gradient_start: string | null
  gradient_end: string | null
  gradient_direction: string | null
  background_image_url: string | null
  background_video_url: string | null
  
  card_style: CardStyle
  card_color: string | null
  card_text_color: string | null
  card_border_radius: string | null
  card_shadow_color: string | null
  
  font_family: string
  font_color: string
  profile_title_color: string
  bio_color: string
  
  button_hover_animation: HoverAnimation
  social_icon_style: SocialIconStyle
  avatar_shape: AvatarShape
  
  hide_branding: boolean
  custom_css: string | null
  
  created_at: string
}

export interface ProfileAppearance {
  theme_id: string | null
  custom_appearance: Partial<Theme> | null
}
