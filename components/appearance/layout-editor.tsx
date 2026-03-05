"use client"

import { useTheme } from "@/context/theme-context"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

export function LayoutEditor() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Label>Layout Style</Label>
        <RadioGroup
          value={theme.layoutStyle}
          onValueChange={(value: "center" | "wide" | "compact") => 
            setTheme({ ...theme, layoutStyle: value })
          }
          className="grid gap-4"
        >
          {["center", "wide", "compact"].map((style) => (
            <div key={style} className="flex items-center space-x-2 border p-4 rounded-lg hover:bg-gray-50">
              <RadioGroupItem value={style} id={`layout-${style}`} />
              <Label htmlFor={`layout-${style}`} className="flex-1 cursor-pointer capitalize">
                {style}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>
    </div>
  )
}
