"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Loader2, Check } from "lucide-react"
import { toast } from "sonner"
import { Theme } from "@/types/theme"

// Simplified theme selection for onboarding
const themes = [
  { id: "default", name: "Classic", color: "#f3f4f6" },
  { id: "minimal", name: "Minimal", color: "#ffffff" },
  { id: "dark", name: "Dark Mode", color: "#111827" },
  { id: "gradient", name: "Gradient", color: "linear-gradient(to bottom right, #8b5cf6, #ec4899)" },
  { id: "glass", name: "Glass", color: "linear-gradient(to bottom right, #e0e7ff, #c7d2fe)" },
]

export default function ThemePage() {
  const router = useRouter()
  const [selectedTheme, setSelectedTheme] = useState<string>("default")
  const [isSaving, setIsSaving] = useState(false)

  const handleSelect = (themeId: string) => {
    setSelectedTheme(themeId)
  }

  const handleContinue = async () => {
    setIsSaving(true)
    const supabase = createClient()
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        toast.error("You must be logged in")
        return
      }

      // We are saving the og_template_style as a proxy for theme for now, 
      // or we could create a proper theme relation. 
      // Based on the schema, we have `themes` relation but also `og_template_style`.
      // Let's assume for onboarding we set the `og_template_style` which drives the default look
      // until they pick a full theme.
      
      const { error } = await supabase
        .from("profiles")
        .update({ 
          og_template_style: selectedTheme,
          // We might also want to set a default theme_id if we had one, 
          // but for now let's stick to what we have.
        })
        .eq("id", user.id)

      if (error) throw error

      router.push("/onboarding/profile")
    } catch (error) {
      console.error(error)
      toast.error("Failed to save theme")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold tracking-tight">Pick a Vibe</h1>
        <p className="text-muted-foreground">
          Select a starting theme. You can change this anytime.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {themes.map((theme) => (
          <button
            key={theme.id}
            onClick={() => handleSelect(theme.id)}
            className={`relative aspect-video rounded-xl border-2 transition-all overflow-hidden group ${
              selectedTheme === theme.id
                ? "border-blue-600 ring-2 ring-blue-600 ring-offset-2"
                : "border-transparent hover:border-gray-200"
            }`}
          >
            <div 
              className="absolute inset-0 w-full h-full"
              style={{ background: theme.color }}
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/10 transition-colors">
              {selectedTheme === theme.id && (
                <div className="bg-blue-600 text-white rounded-full p-1 shadow-sm">
                  <Check className="w-4 h-4" />
                </div>
              )}
            </div>
            <span className="absolute bottom-2 left-2 text-xs font-medium px-2 py-1 bg-white/80 backdrop-blur-sm rounded-md shadow-sm">
              {theme.name}
            </span>
          </button>
        ))}
      </div>

      <Button 
        onClick={handleContinue} 
        className="w-full" 
        disabled={isSaving}
      >
        {isSaving ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Saving...
          </>
        ) : (
          "Continue"
        )}
      </Button>
    </div>
  )
}
