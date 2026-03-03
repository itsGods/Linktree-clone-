"use client"

import { useState } from "react"
import Image from "next/image"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical, MoreVertical, Clock, Star, Trash2, Copy, Pencil, Image as ImageIcon } from "lucide-react"
import { format } from "date-fns"
import { toast } from "sonner"

import { Card } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Link } from "@/types/links"
import { updateLink, deleteLink, duplicateLink, toggleActive } from "@/server/actions/links"
import { ScheduleModal } from "./schedule-modal"
import { HighlightModal } from "./highlight-modal"
import { createClient } from "@/lib/supabase/client"

interface LinkCardProps {
  link: Link
}

export function LinkCard({ link }: LinkCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [title, setTitle] = useState(link.title || "")
  const [url, setUrl] = useState(link.url || "")
  const [scheduleOpen, setScheduleOpen] = useState(false)
  const [highlightOpen, setHighlightOpen] = useState(false)

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: link.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const handleSave = async () => {
    try {
      await updateLink(link.id, { title, url })
      setIsEditing(false)
      toast.success("Link updated")
    } catch (error) {
      toast.error("Failed to update link")
    }
  }

  const handleToggleActive = async (checked: boolean) => {
    try {
      await toggleActive(link.id, !checked) // Toggle logic handled in action
      toast.success(checked ? "Link activated" : "Link deactivated")
    } catch (error) {
      toast.error("Failed to toggle link")
    }
  }

  const handleDelete = async () => {
    try {
      await deleteLink(link.id)
      toast.success("Link deleted")
    } catch (error) {
      toast.error("Failed to delete link")
    }
  }

  const handleDuplicate = async () => {
    try {
      await duplicateLink(link)
      toast.success("Link duplicated")
    } catch (error) {
      toast.error("Failed to duplicate link")
    }
  }

  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const fileExt = file.name.split('.').pop()
    const filePath = `${user.id}/${link.id}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from('thumbnails')
      .upload(filePath, file, { upsert: true })

    if (uploadError) {
      toast.error('Error uploading thumbnail')
      return
    }

    const { data: { publicUrl } } = supabase.storage
      .from('thumbnails')
      .getPublicUrl(filePath)

    await updateLink(link.id, { thumbnail_url: publicUrl })
    toast.success('Thumbnail updated')
  }

  const isScheduled = link.schedule_start || link.schedule_end

  return (
    <>
      <Card ref={setNodeRef} style={style} className="flex items-center p-4 gap-4 bg-white hover:shadow-md transition-shadow">
        <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600">
          <GripVertical className="h-5 w-5" />
        </div>

        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            {isEditing ? (
              <Input 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                className="h-8 font-medium"
                autoFocus
              />
            ) : (
              <span className="font-medium text-gray-900">{link.title}</span>
            )}
            
            <Badge variant="secondary" className="text-xs capitalize">
              {link.type.replace('_', ' ')}
            </Badge>
            
            {isScheduled && (
              <Badge variant="outline" className="text-xs gap-1">
                <Clock className="h-3 w-3" />
                Scheduled
              </Badge>
            )}
            
            {link.is_highlighted && (
              <Badge variant="default" className="text-xs gap-1 bg-yellow-500 hover:bg-yellow-600">
                <Star className="h-3 w-3 fill-current" />
                Highlighted
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-4 text-sm text-gray-500">
            {isEditing ? (
              <Input 
                value={url} 
                onChange={(e) => setUrl(e.target.value)} 
                className="h-8 text-sm"
                placeholder="https://example.com"
              />
            ) : (
              <span className="truncate max-w-[300px]">{link.url}</span>
            )}
            
            <span className="flex items-center gap-1">
              <span className="font-semibold">{link.click_count}</span> clicks
            </span>
          </div>

          {isEditing && (
            <div className="flex gap-2 mt-2">
              <Button size="sm" onClick={handleSave}>Save</Button>
              <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)}>Cancel</Button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          <label className="cursor-pointer hover:opacity-80 transition-opacity relative h-10 w-10 block">
            <input type="file" className="hidden" accept="image/*" onChange={handleThumbnailUpload} />
            {link.thumbnail_url ? (
              <Image 
                src={link.thumbnail_url} 
                alt="Thumbnail" 
                fill
                className="rounded object-cover border" 
              />
            ) : (
              <div className="h-10 w-10 rounded bg-gray-100 flex items-center justify-center border border-dashed">
                <ImageIcon className="h-4 w-4 text-gray-400" />
              </div>
            )}
          </label>

          <Switch 
            checked={link.is_active} 
            onCheckedChange={handleToggleActive}
          />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setIsEditing(true)}>
                <Pencil className="mr-2 h-4 w-4" /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDuplicate}>
                <Copy className="mr-2 h-4 w-4" /> Duplicate
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setScheduleOpen(true)}>
                <Clock className="mr-2 h-4 w-4" /> Schedule
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setHighlightOpen(true)}>
                <Star className="mr-2 h-4 w-4" /> Highlight
              </DropdownMenuItem>
              <DropdownMenuItem className="text-red-600 focus:text-red-600" onClick={handleDelete}>
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </Card>

      <ScheduleModal 
        link={link} 
        open={scheduleOpen} 
        onOpenChange={setScheduleOpen} 
      />
      
      <HighlightModal 
        link={link} 
        open={highlightOpen} 
        onOpenChange={setHighlightOpen} 
      />
    </>
  )
}
