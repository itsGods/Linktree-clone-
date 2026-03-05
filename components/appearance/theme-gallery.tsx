"use client"

import { useTheme, themes } from "@/context/theme-context"
import { cn } from "@/lib/utils"

export function ThemeGallery() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {themes.map((t) => (
        <button
          key={t.themeId}
          onClick={() => setTheme(t)}
          className={cn(
            "relative flex flex-col items-center p-4 rounded-xl border-2 transition-all",
            theme.themeId === t.themeId ? "border-black" : "border-transparent hover:border-gray-200"
          )}
          style={{
            background: t.backgroundType === 'color' ? t.backgroundColor : t.backgroundGradient
          }}
        >
          <div className="w-full h-24 rounded-lg mb-3 flex flex-col gap-2 items-center justify-center p-2">
            <div 
              className="w-full h-6 rounded-md" 
              style={{ 
                backgroundColor: t.buttonColor,
                borderRadius: t.buttonRadius,
                border: t.buttonStyle === 'outline' ? `2px solid ${t.buttonColor}` : 'none',
                background: t.buttonStyle === 'outline' ? 'transparent' : t.buttonColor,
                opacity: t.buttonStyle === 'soft' ? 0.8 : 1
              }} 
            />
            <div 
              className="w-full h-6 rounded-md" 
              style={{ 
                backgroundColor: t.buttonColor,
                borderRadius: t.buttonRadius,
                border: t.buttonStyle === 'outline' ? `2px solid ${t.buttonColor}` : 'none',
                background: t.buttonStyle === 'outline' ? 'transparent' : t.buttonColor,
                opacity: t.buttonStyle === 'soft' ? 0.8 : 1
              }} 
            />
          </div>
          <span className="text-sm font-medium capitalize mix-blend-difference text-white">{t.themeId}</span>
        </button>
      ))}
    </div>
  )
}
