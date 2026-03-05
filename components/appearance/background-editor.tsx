"use client"

import { useTheme } from "@/context/theme-context"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Input } from "@/components/ui/input"

export function BackgroundEditor() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Label>Background Type</Label>
        <RadioGroup
          value={theme.backgroundType}
          onValueChange={(value: "color" | "gradient" | "image") => 
            setTheme({ ...theme, backgroundType: value })
          }
          className="flex gap-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="color" id="color" />
            <Label htmlFor="color">Color</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="gradient" id="gradient" />
            <Label htmlFor="gradient">Gradient</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="image" id="image" />
            <Label htmlFor="image">Image</Label>
          </div>
        </RadioGroup>
      </div>

      {theme.backgroundType === "color" && (
        <div className="space-y-3">
          <Label>Background Color</Label>
          <div className="flex gap-3">
            <Input
              type="color"
              value={theme.backgroundColor}
              onChange={(e) => setTheme({ ...theme, backgroundColor: e.target.value })}
              className="w-16 h-10 p-1"
            />
            <Input
              type="text"
              value={theme.backgroundColor}
              onChange={(e) => setTheme({ ...theme, backgroundColor: e.target.value })}
              className="flex-1"
            />
          </div>
        </div>
      )}

      {theme.backgroundType === "gradient" && (
        <div className="space-y-3">
          <Label>Background Gradient</Label>
          <Input
            type="text"
            value={theme.backgroundGradient}
            onChange={(e) => setTheme({ ...theme, backgroundGradient: e.target.value })}
            placeholder="linear-gradient(135deg, #ff7e5f, #feb47b)"
          />
        </div>
      )}

      {theme.backgroundType === "image" && (
        <div className="space-y-3">
          <Label>Background Image URL</Label>
          <Input
            type="url"
            value={theme.backgroundImage}
            onChange={(e) => setTheme({ ...theme, backgroundImage: e.target.value })}
            placeholder="https://example.com/image.jpg"
          />
        </div>
      )}
    </div>
  )
}
