"use client"

import { useTheme } from "@/context/theme-context"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"

export function CardEditor() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Label>Button Style</Label>
        <RadioGroup
          value={theme.buttonStyle}
          onValueChange={(value: "fill" | "outline" | "soft" | "hard") => 
            setTheme({ ...theme, buttonStyle: value })
          }
          className="grid grid-cols-2 gap-4"
        >
          {["fill", "outline", "soft", "hard"].map((style) => (
            <div key={style} className="flex items-center space-x-2">
              <RadioGroupItem value={style} id={`style-${style}`} />
              <Label htmlFor={`style-${style}`} className="capitalize">{style}</Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      <div className="space-y-3">
        <Label>Button Color</Label>
        <div className="flex gap-3">
          <Input
            type="color"
            value={theme.buttonColor}
            onChange={(e) => setTheme({ ...theme, buttonColor: e.target.value })}
            className="w-16 h-10 p-1"
          />
          <Input
            type="text"
            value={theme.buttonColor}
            onChange={(e) => setTheme({ ...theme, buttonColor: e.target.value })}
            className="flex-1"
          />
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between">
          <Label>Border Radius</Label>
          <span className="text-sm text-gray-500">{theme.buttonRadius}px</span>
        </div>
        <Slider
          value={[theme.buttonRadius]}
          onValueChange={([value]) => setTheme({ ...theme, buttonRadius: value })}
          max={40}
          step={1}
        />
      </div>
    </div>
  )
}
