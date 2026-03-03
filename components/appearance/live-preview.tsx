"use client"

import { useAppearanceStore } from "@/store/appearance-store"
import { generateThemeCSS } from "@/lib/theme/resolve-theme"
import { LinkRenderer } from "@/components/links/renderers"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Link } from "@/types/links"

// Mock data for preview
const PREVIEW_LINKS: Link[] = [
  {
    id: '1',
    profile_id: 'preview',
    type: 'classic',
    title: 'My Website',
    url: 'https://example.com',
    thumbnail_url: null,
    icon: null,
    position: 0,
    is_active: true,
    is_highlighted: false,
    highlight_animation: 'none',
    layout: 'classic',
    schedule_start: null,
    schedule_end: null,
    click_count: 120,
    metadata: {},
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '2',
    profile_id: 'preview',
    type: 'classic',
    title: 'Latest Video',
    url: 'https://youtube.com',
    thumbnail_url: null,
    icon: null,
    position: 1,
    is_active: true,
    is_highlighted: true,
    highlight_animation: 'pulse',
    layout: 'classic',
    schedule_start: null,
    schedule_end: null,
    click_count: 85,
    metadata: {},
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
]

export function LivePreview() {
  const { previewTheme, profile } = useAppearanceStore()
  const themeCSS = generateThemeCSS(previewTheme)

  return (
    <div className="w-full h-full flex items-center justify-center bg-gray-100 p-4">
      <div className="w-[320px] h-[640px] bg-white rounded-[3rem] border-8 border-gray-900 shadow-2xl overflow-hidden relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-gray-900 rounded-b-xl z-20"></div>
        
        {/* Preview Content */}
        <div 
          className="w-full h-full overflow-y-auto no-scrollbar"
          style={themeCSS as React.CSSProperties}
        >
          {/* Background Layer */}
          <div className="absolute inset-0 -z-10" style={{ background: 'var(--bg)' }}></div>
          
          <div className="flex flex-col items-center py-12 px-4 min-h-full">
            {/* Profile Header */}
            <div className="flex flex-col items-center space-y-4 mb-8 text-center">
              <Avatar className={`h-24 w-24 border-2 border-white shadow-md ${previewTheme.avatar_shape === 'square' ? 'rounded-none' : previewTheme.avatar_shape === 'rounded' ? 'rounded-xl' : 'rounded-full'}`}>
                <AvatarImage src={profile?.avatar_url || ""} />
                <AvatarFallback>{profile?.display_name?.[0] || "U"}</AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-xl font-bold" style={{ color: 'var(--title-color)' }}>
                  {profile?.display_name || "@username"}
                </h1>
                <p className="text-sm mt-1" style={{ color: 'var(--bio-color)' }}>
                  {profile?.bio || "This is a preview of your bio."}
                </p>
              </div>
            </div>

            {/* Links */}
            <div className="w-full space-y-4">
              {PREVIEW_LINKS.map(link => (
                <div key={link.id} style={{ 
                  '--card-bg': previewTheme.card_color,
                  '--card-text': previewTheme.card_text_color,
                  '--card-radius': previewTheme.card_border_radius === 'full' ? '9999px' : previewTheme.card_border_radius === 'lg' ? '16px' : previewTheme.card_border_radius === 'md' ? '8px' : previewTheme.card_border_radius === 'sm' ? '4px' : '0px',
                } as React.CSSProperties}>
                  <LinkRenderer link={link} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
