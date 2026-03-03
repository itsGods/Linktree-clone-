export type LinkType = 
  | 'classic'
  | 'header'
  | 'text_block'
  | 'image'
  | 'video'
  | 'music'
  | 'commerce'
  | 'email_collector'
  | 'contact'
  | 'map'

export type HighlightAnimation = 
  | 'none'
  | 'shake'
  | 'pulse'
  | 'bounce'
  | 'glow'

export type LinkLayout = 
  | 'classic'
  | 'featured'
  | 'thumbnail_left'
  | 'thumbnail_right'

export interface Link {
  id: string
  profile_id: string
  type: LinkType
  title: string | null
  url: string | null
  thumbnail_url: string | null
  icon: string | null
  position: number
  is_active: boolean
  is_highlighted: boolean
  highlight_animation: HighlightAnimation
  layout: LinkLayout
  schedule_start: string | null
  schedule_end: string | null
  click_count: number
  metadata: Record<string, any>
  created_at: string
  updated_at: string
}
