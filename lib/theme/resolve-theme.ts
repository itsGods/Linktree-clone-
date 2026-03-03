import { Theme } from "@/types/theme"

export const DEFAULT_THEME: Theme = {
  id: 'default',
  name: 'Clean White',
  is_premium: false,
  is_system: true,
  background_type: 'solid',
  background_value: '#ffffff',
  gradient_start: null,
  gradient_end: null,
  gradient_direction: null,
  background_image_url: null,
  background_video_url: null,
  card_style: 'soft_shadow',
  card_color: '#ffffff',
  card_text_color: '#000000',
  card_border_radius: 'md',
  card_shadow_color: 'rgba(0,0,0,0.1)',
  font_family: 'Inter',
  font_color: '#000000',
  profile_title_color: '#000000',
  bio_color: '#666666',
  button_hover_animation: 'scale',
  social_icon_style: 'filled',
  avatar_shape: 'circle',
  hide_branding: false,
  custom_css: null,
  created_at: new Date().toISOString()
}

export function resolveTheme(
  baseTheme: Theme | null,
  customAppearance: Partial<Theme> | null
): Theme {
  // Start with default
  let resolved = { ...DEFAULT_THEME }

  // Apply base theme if exists
  if (baseTheme) {
    resolved = { ...resolved, ...baseTheme }
  }

  // Apply custom overrides
  if (customAppearance) {
    // Filter out null/undefined values from customAppearance to avoid overwriting with empty
    const cleanOverrides = Object.fromEntries(
      Object.entries(customAppearance).filter(([_, v]) => v !== null && v !== undefined)
    )
    resolved = { ...resolved, ...cleanOverrides }
  }

  return resolved
}

export function generateThemeCSS(theme: Theme): React.CSSProperties {
  const css: any = {
    '--bg-value': theme.background_value,
    '--card-bg': theme.card_color,
    '--card-text': theme.card_text_color,
    '--card-shadow': theme.card_shadow_color,
    '--font-color': theme.font_color,
    '--title-color': theme.profile_title_color,
    '--bio-color': theme.bio_color,
  }

  // Handle Background
  if (theme.background_type === 'solid') {
    css['--bg'] = theme.background_value
  } else if (theme.background_type === 'gradient') {
    css['--bg'] = `linear-gradient(${theme.gradient_direction || 'to bottom'}, ${theme.gradient_start}, ${theme.gradient_end})`
  } else if (theme.background_type === 'image') {
    css['--bg'] = `url(${theme.background_image_url}) center/cover no-repeat fixed`
  }

  // Handle Radius
  const radiusMap: Record<string, string> = {
    'none': '0px',
    'sm': '4px',
    'md': '8px',
    'lg': '16px',
    'full': '9999px'
  }
  css['--card-radius'] = radiusMap[theme.card_border_radius || 'md']

  // Handle Font Family (This maps to the CSS variable provided by next/font)
  const fontMap: Record<string, string> = {
    'Inter': 'var(--font-inter)',
    'Poppins': 'var(--font-poppins)',
    'DM Sans': 'var(--font-dm-sans)',
    'Space Grotesk': 'var(--font-space-grotesk)',
    'Outfit': 'var(--font-outfit)',
    'Plus Jakarta Sans': 'var(--font-plus-jakarta)',
    'Playfair Display': 'var(--font-playfair)',
    'Montserrat': 'var(--font-montserrat)',
  }
  css['--font-family'] = fontMap[theme.font_family || 'Inter'] || 'sans-serif'

  return css as React.CSSProperties
}
