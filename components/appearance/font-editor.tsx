"use client"

import { useTheme } from "@/context/theme-context"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

export function FontEditor() {
  const { theme, setTheme } = useTheme()

  const fonts = [
    { id: "modern", name: "Modern (Inter)", class: "font-sans" },
    { id: "rounded", name: "Rounded (Nunito)", class: "font-sans font-bold tracking-tight" },
    { id: "minimal", name: "Minimal (Mono)", class: "font-mono" },
    { id: "serif", name: "Classic (Serif)", class: "font-serif" },
  ]

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Label>Font Family</Label>
        <RadioGroup
          value={theme.fontFamily}
          onValueChange={(value: "modern" | "rounded" | "minimal" | "serif") => 
            setTheme({ ...theme, fontFamily: value })
          }
          className="grid gap-4"
        >
          {fonts.map((font) => (
            <div key={font.id} className="flex items-center space-x-2 border p-4 rounded-lg hover:bg-gray-50">
              <RadioGroupItem value={font.id} id={`font-${font.id}`} />
              <Label htmlFor={`font-${font.id}`} className={`flex-1 cursor-pointer ${font.class}`}>
                {font.name}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>
    </div>
  )
}
