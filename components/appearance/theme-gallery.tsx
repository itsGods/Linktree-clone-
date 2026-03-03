"use client"

import { useState } from "react"
import { useAppearanceStore } from "@/store/appearance-store"
import { Theme } from "@/types/theme"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Lock } from "lucide-react"

interface ThemeGalleryProps {
  themes: Theme[]
}

export function ThemeGallery({ themes }: ThemeGalleryProps) {
  const { selectedTheme, setTheme } = useAppearanceStore()
  const [filter, setFilter] = useState('all')

  const filteredThemes = filter === 'all' 
    ? themes 
    : themes.filter(t => t.name.toLowerCase().includes(filter))

  return (
    <div className="space-y-4">
      <div className="flex gap-2 overflow-x-auto pb-2">
        <button 
          className={`px-3 py-1 rounded-full text-sm ${filter === 'all' ? 'bg-black text-white' : 'bg-gray-100'}`}
          onClick={() => setFilter('all')}
        >
          All
        </button>
        <button 
          className={`px-3 py-1 rounded-full text-sm ${filter === 'minimal' ? 'bg-black text-white' : 'bg-gray-100'}`}
          onClick={() => setFilter('minimal')}
        >
          Minimal
        </button>
        <button 
          className={`px-3 py-1 rounded-full text-sm ${filter === 'gradient' ? 'bg-black text-white' : 'bg-gray-100'}`}
          onClick={() => setFilter('gradient')}
        >
          Gradient
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {filteredThemes.map((theme) => {
          const isActive = selectedTheme?.id === theme.id
          
          return (
            <div 
              key={theme.id}
              className={`relative cursor-pointer group ${isActive ? 'ring-2 ring-black ring-offset-2 rounded-lg' : ''}`}
              onClick={() => setTheme(theme)}
            >
              <div 
                className="aspect-[9/16] rounded-lg border overflow-hidden relative shadow-sm hover:shadow-md transition-shadow"
                style={{
                  background: theme.background_type === 'gradient' 
                    ? `linear-gradient(${theme.gradient_direction || 'to bottom'}, ${theme.gradient_start}, ${theme.gradient_end})`
                    : theme.background_value || '#fff'
                }}
              >
                {/* Mini Preview Content */}
                <div className="p-2 space-y-2 opacity-50 scale-75 origin-top">
                  <div className="w-12 h-12 rounded-full bg-gray-200 mx-auto" />
                  <div className="h-2 w-20 bg-gray-200 rounded mx-auto" />
                  <div className="space-y-1 mt-4">
                    <div className="h-8 w-full bg-white/50 rounded-md border border-black/5" />
                    <div className="h-8 w-full bg-white/50 rounded-md border border-black/5" />
                    <div className="h-8 w-full bg-white/50 rounded-md border border-black/5" />
                  </div>
                </div>

                {theme.is_premium && (
                  <div className="absolute top-2 right-2">
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">
                      <Lock className="w-3 h-3 mr-1" /> Pro
                    </Badge>
                  </div>
                )}
                
                {isActive && (
                  <div className="absolute inset-0 bg-black/5 flex items-center justify-center">
                    <div className="bg-white px-3 py-1 rounded-full text-xs font-medium shadow-sm">
                      Active
                    </div>
                  </div>
                )}
              </div>
              <div className="mt-2 text-sm font-medium text-center truncate">
                {theme.name}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
