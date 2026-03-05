"use client"

import { useTheme } from "@/context/theme-context"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

export function AnimationEditor() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Label>Hover Animation</Label>
        <RadioGroup
          value={theme.animationStyle}
          onValueChange={(value: "fade" | "slide" | "bounce" | "none") => 
            setTheme({ ...theme, animationStyle: value })
          }
          className="grid gap-4"
        >
          {["fade", "slide", "bounce", "none"].map((style) => (
            <div key={style} className="flex items-center space-x-2 border p-4 rounded-lg hover:bg-gray-50">
              <RadioGroupItem value={style} id={`anim-${style}`} />
              <Label htmlFor={`anim-${style}`} className="flex-1 cursor-pointer capitalize">
                {style}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>
    </div>
  )
}
