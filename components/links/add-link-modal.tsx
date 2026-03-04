"use client"

import { useState } from "react"
import { Plus, Type, Image as ImageIcon, Video, Music, ShoppingBag, Mail, MapPin, Link as LinkIcon, LayoutTemplate } from "lucide-react"
import { toast } from "sonner"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { createLink } from "@/server/actions/links"
import { LinkType } from "@/types/links"

const linkTypes: { type: LinkType; label: string; icon: React.ReactNode }[] = [
  { type: 'classic', label: 'Link', icon: <LinkIcon className="h-6 w-6" /> },
  { type: 'header', label: 'Header', icon: <Type className="h-6 w-6" /> },
  { type: 'text_block', label: 'Text Block', icon: <LayoutTemplate className="h-6 w-6" /> },
  { type: 'image', label: 'Image', icon: <ImageIcon className="h-6 w-6" /> },
  { type: 'video', label: 'Video', icon: <Video className="h-6 w-6" /> },
  { type: 'music', label: 'Music', icon: <Music className="h-6 w-6" /> },
  { type: 'commerce', label: 'Commerce', icon: <ShoppingBag className="h-6 w-6" /> },
  { type: 'email_collector', label: 'Email', icon: <Mail className="h-6 w-6" /> },
  { type: 'contact', label: 'Contact', icon: <MapPin className="h-6 w-6" /> },
  { type: 'map', label: 'Map', icon: <MapPin className="h-6 w-6" /> },
]

export function AddLinkModal() {
  const [open, setOpen] = useState(false)

  const handleAddLink = async (type: LinkType) => {
    try {
      await createLink({ type })
      toast.success(`Added ${type.replace('_', ' ')}`)
      setOpen(false)
    } catch (error) {
      toast.error("Failed to add link")
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="w-full py-3 rounded-xl bg-black text-white font-medium flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors">
          <Plus className="h-4 w-4" /> Add Link
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add to your Linktree</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-3 gap-4 py-4">
          {linkTypes.map((item) => (
            <button
              key={item.type}
              className="flex flex-col items-center justify-center gap-2 p-4 rounded-lg border hover:bg-gray-50 hover:border-gray-300 transition-all"
              onClick={() => handleAddLink(item.type)}
            >
              <div className="text-gray-600">{item.icon}</div>
              <span className="text-xs font-medium text-gray-700">{item.label}</span>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
