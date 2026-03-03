"use client"

import { useAppearanceStore } from "@/store/appearance-store"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { fonts } from "@/lib/fonts"

export function FontEditor() {
  const { customAppearance, updateCustom } = useAppearanceStore()

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>Font Family</Label>
        <Select 
          value={customAppearance.font_family || 'Inter'} 
          onValueChange={(v) => updateCustom({ font_family: v })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.keys(fonts).map((font) => (
              <SelectItem key={font} value={font}>
                {font}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Font Color</Label>
        <div className="flex gap-2">
          <Input 
            type="color" 
            value={customAppearance.font_color || '#000000'}
            onChange={(e) => updateCustom({ font_color: e.target.value })}
            className="w-10 h-10 p-1"
          />
          <Input 
            value={customAppearance.font_color || '#000000'}
            onChange={(e) => updateCustom({ font_color: e.target.value })}
            className="flex-1"
          />
        </div>
      </div>
    </div>
  )
}
