import { ThemeState, defaultTheme } from "@/context/theme-context"

export function resolveTheme(
  customAppearance: Partial<ThemeState> | string | null
): ThemeState {
  // Start with default
  let resolved = { ...defaultTheme }

  // Apply custom overrides
  if (customAppearance) {
    let parsedAppearance = customAppearance
    if (typeof customAppearance === 'string') {
      try {
        parsedAppearance = JSON.parse(customAppearance)
      } catch (e) {
        parsedAppearance = {}
      }
    }

    if (typeof parsedAppearance === 'object' && parsedAppearance !== null) {
      // Filter out null/undefined values from customAppearance to avoid overwriting with empty
      const cleanOverrides = Object.fromEntries(
        Object.entries(parsedAppearance).filter(([_, v]) => v !== null && v !== undefined)
      )
      resolved = { ...resolved, ...cleanOverrides }
    }
  }

  return resolved
}

export function generateThemeCSS(theme: ThemeState): React.CSSProperties {
  const css: any = {}

  // Handle Background
  if (theme.backgroundType === 'color') {
    css['--bg'] = theme.backgroundColor
  } else if (theme.backgroundType === 'gradient') {
    css['--bg'] = theme.backgroundGradient
  } else if (theme.backgroundType === 'image') {
    css['--bg'] = `url(${theme.backgroundImage}) center/cover no-repeat fixed`
  }

  // Handle Button Style
  css['--card-radius'] = `${theme.buttonRadius}px`
  
  if (theme.buttonStyle === 'outline') {
    css['--card-bg'] = 'transparent'
    css['--card-border'] = `2px solid ${theme.buttonColor}`
    css['--card-text'] = theme.buttonColor
  } else if (theme.buttonStyle === 'soft') {
    css['--card-bg'] = theme.buttonColor
    css['--card-opacity'] = '0.8'
    css['--card-text'] = '#ffffff'
  } else if (theme.buttonStyle === 'hard') {
    css['--card-bg'] = theme.buttonColor
    css['--card-shadow'] = '4px 4px 0px 0px #000000'
    css['--card-text'] = '#ffffff'
  } else {
    // fill
    css['--card-bg'] = theme.buttonColor
    css['--card-text'] = '#ffffff'
  }

  // Handle Font Family
  const fontMap: Record<string, string> = {
    'modern': 'var(--font-sans)',
    'rounded': 'var(--font-sans)',
    'minimal': 'var(--font-mono)',
    'serif': 'var(--font-serif)',
  }
  css['--font-family'] = fontMap[theme.fontFamily || 'modern'] || 'sans-serif'
  
  // Font Color based on background
  const isDarkBg = theme.backgroundType === 'color' && theme.backgroundColor === '#0f0f0f'
  css['--font-color'] = isDarkBg ? '#ffffff' : '#111827'
  css['--title-color'] = isDarkBg ? '#ffffff' : '#111827'
  css['--bio-color'] = isDarkBg ? 'rgba(255,255,255,0.8)' : 'rgba(17,24,39,0.8)'

  return css as React.CSSProperties
}
