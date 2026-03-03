"use client"

import { useState } from "react"
import { toast } from "sonner"
import { motion } from "motion/react"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Link, HighlightAnimation } from "@/types/links"
import { updateLink } from "@/server/actions/links"

interface HighlightModalProps {
  link: Link
  open: boolean
  onOpenChange: (open: boolean) => void
}

const animations: { value: HighlightAnimation; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'shake', label: 'Shake' },
  { value: 'pulse', label: 'Pulse' },
  { value: 'bounce', label: 'Bounce' },
  { value: 'glow', label: 'Glow' },
]

export function HighlightModal({ link, open, onOpenChange }: HighlightModalProps) {
  const [isHighlighted, setIsHighlighted] = useState(link.is_highlighted)
  const [animation, setAnimation] = useState<HighlightAnimation>(link.highlight_animation)

  const handleSave = async () => {
    try {
      await updateLink(link.id, {
        is_highlighted: isHighlighted,
        highlight_animation: animation,
      })
      
      toast.success("Highlight updated")
      onOpenChange(false)
    } catch (error) {
      toast.error("Failed to update highlight")
    }
  }

  const getAnimationVariant = (anim: HighlightAnimation) => {
    switch (anim) {
      case 'shake': return { x: [0, -5, 5, -5, 5, 0], transition: { repeat: Infinity, duration: 2 } }
      case 'pulse': return { scale: [1, 1.05, 1], transition: { repeat: Infinity, duration: 1.5 } }
      case 'bounce': return { y: [0, -10, 0], transition: { repeat: Infinity, duration: 1 } }
      case 'glow': return { boxShadow: ["0 0 0px rgba(0,0,0,0)", "0 0 20px rgba(59,130,246,0.5)", "0 0 0px rgba(0,0,0,0)"], transition: { repeat: Infinity, duration: 2 } }
      default: return {}
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Highlight Link</DialogTitle>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="highlight-toggle">Enable Highlight</Label>
            <Switch
              id="highlight-toggle"
              checked={isHighlighted}
              onCheckedChange={setIsHighlighted}
            />
          </div>

          <div className="space-y-2">
            <Label>Animation</Label>
            <Select value={animation} onValueChange={(v) => setAnimation(v as HighlightAnimation)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {animations.map((anim) => (
                  <SelectItem key={anim.value} value={anim.value}>
                    {anim.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-center p-6 bg-gray-50 rounded-lg border">
            <motion.div
              animate={isHighlighted ? getAnimationVariant(animation) : {}}
              className="px-6 py-3 bg-white border rounded-full shadow-sm font-medium text-gray-900"
            >
              Preview Button
            </motion.div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave}>Save Highlight</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
