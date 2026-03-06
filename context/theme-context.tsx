"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"

export interface ThemeState {
  themeId: string
  backgroundType: "color" | "gradient" | "image"
  backgroundColor: string
  backgroundGradient: string
  backgroundImage: string
  buttonStyle: "fill" | "outline" | "soft" | "hard"
  buttonRadius: number
  buttonColor: string
  fontFamily: "modern" | "rounded" | "minimal" | "serif"
  layoutStyle: "center" | "wide" | "compact"
  animationStyle: "fade" | "slide" | "bounce" | "none"
  avatarShape: "circle" | "rounded" | "square"
  hideBranding: boolean
}

export const defaultTheme: ThemeState = {
  themeId: "clean",
  backgroundType: "color",
  backgroundColor: "#ffffff",
  backgroundGradient: "linear-gradient(135deg, #ff7e5f, #feb47b)",
  backgroundImage: "",
  buttonStyle: "fill",
  buttonRadius: 16,
  buttonColor: "#000000",
  fontFamily: "modern",
  layoutStyle: "center",
  animationStyle: "fade",
  avatarShape: "circle",
  hideBranding: false
}

export const themes: ThemeState[] = [
  {
    ...defaultTheme,
    themeId: "clean",
    backgroundColor: "#ffffff",
    buttonStyle: "fill",
    buttonColor: "#000000",
    buttonRadius: 24,
  },
  {
    ...defaultTheme,
    themeId: "dark",
    backgroundType: "color",
    backgroundColor: "#0f0f0f",
    buttonStyle: "fill",
    buttonColor: "#ffffff",
    buttonRadius: 24,
  },
  {
    ...defaultTheme,
    themeId: "sunset",
    backgroundType: "gradient",
    backgroundGradient: "linear-gradient(135deg, #ff7e5f, #feb47b)",
    buttonStyle: "fill",
    buttonColor: "#ffffff",
    buttonRadius: 12,
  }
]

interface ThemeContextType {
  theme: ThemeState
  setTheme: (theme: ThemeState) => void
  saveTheme: () => Promise<void>
  isSaving: boolean
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children, initialTheme }: { children: React.ReactNode, initialTheme?: Partial<ThemeState> }) {
  let parsedInitialTheme = initialTheme
  if (typeof initialTheme === 'string') {
    try {
      parsedInitialTheme = JSON.parse(initialTheme)
    } catch (e) {
      parsedInitialTheme = {}
    }
  }

  const [theme, setThemeState] = useState<ThemeState>({ ...defaultTheme, ...parsedInitialTheme })
  const [isSaving, setIsSaving] = useState(false)
  const supabase = createClient()

  const setTheme = (newTheme: ThemeState) => {
    console.log("Setting new theme:", newTheme)
    setThemeState(newTheme)
  }

  const saveTheme = async () => {
    setIsSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      await supabase
        .from('profiles')
        .update({ custom_appearance: theme })
        .eq('id', user.id)
    } catch (error) {
      console.error('Error saving theme:', error)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, saveTheme, isSaving }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}
