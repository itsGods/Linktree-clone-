"use client"

import { useAppearanceStore } from "@/store/appearance-store"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CardStyle, HoverAnimation } from "@/types/theme"

export function CardEditor() {
  const { customAppearance, updateCustom } = useAppearanceStore()

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>Button Style</Label>
        <div className="grid grid-cols-3 gap-2">
          {['fill', 'outline', 'soft_shadow', 'hard_shadow', 'glass'].map((style) => (
            <button
              key={style}
              className={`p-2 text-xs border rounded capitalize ${customAppearance.card_style === style ? 'bg-black text-white' : 'hover:bg-gray-50'}`}
              onClick={() => updateCustom({ card_style: style as CardStyle })}
            >
              {style.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Button Color</Label>
          <div className="flex gap-2">
            <Input 
              type="color" 
              value={customAppearance.card_color || '#ffffff'}
              onChange={(e) => updateCustom({ card_color: e.target.value })}
              className="w-10 h-10 p-1"
            />
            <Input 
              value={customAppearance.card_color || '#ffffff'}
              onChange={(e) => updateCustom({ card_color: e.target.value })}
              className="flex-1"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Text Color</Label>
          <div className="flex gap-2">
            <Input 
              type="color" 
              value={customAppearance.card_text_color || '#000000'}
              onChange={(e) => updateCustom({ card_text_color: e.target.value })}
              className="w-10 h-10 p-1"
            />
            <Input 
              value={customAppearance.card_text_color || '#000000'}
              onChange={(e) => updateCustom({ card_text_color: e.target.value })}
              className="flex-1"
            />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Border Radius</Label>
        <div className="grid grid-cols-5 gap-2">
          {['none', 'sm', 'md', 'lg', 'full'].map((radius) => (
            <button
              key={radius}
              className={`p-2 text-xs border rounded capitalize ${customAppearance.card_border_radius === radius ? 'bg-black text-white' : 'hover:bg-gray-50'}`}
              onClick={() => updateCustom({ card_border_radius: radius })}
            >
              {radius}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Hover Animation</Label>
        <Select 
          value={customAppearance.button_hover_animation || 'scale'} 
          onValueChange={(v) => updateCustom({ button_hover_animation: v as HoverAnimation })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">None</SelectItem>
            <SelectItem value="scale">Scale</SelectItem>
            <SelectItem value="lift">Lift</SelectItem>
            <SelectItem value="glow">Glow</SelectItem>
            <SelectItem value="fill">Fill Sweep</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
