"use client"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical, MoreVertical, Clock, Star, Trash2, Copy, Pencil, Image as ImageIcon, Check, X, Loader2 } from "lucide-react"
import { format } from "date-fns"
import { toast } from "sonner"
import { z } from "zod"

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
import { useLinkEditorStore } from "@/store/linkEditorStore"
import { duplicateLink } from "@/server/actions/links" // Keep duplicate as server action for now or move to store? Store is better.
import { ScheduleModal } from "./schedule-modal"
import { HighlightModal } from "./highlight-modal"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"

interface LinkCardProps {
  link: Link
}

const urlSchema = z.string().url()

export function LinkCard({ link }: LinkCardProps) {
  const { updateLink, deleteLink, toggleActive } = useLinkEditorStore()
  
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [isEditingUrl, setIsEditingUrl] = useState(false)
  const [title, setTitle] = useState(link.title || "")
  const [url, setUrl] = useState(link.url || "")
  const [isSaving, setIsSaving] = useState(false)
  const [urlError, setUrlError] = useState<string | null>(null)

  const [scheduleOpen, setScheduleOpen] = useState(false)
  const [highlightOpen, setHighlightOpen] = useState(false)

  const titleInputRef = useRef<HTMLInputElement>(null)
  const urlInputRef = useRef<HTMLInputElement>(null)

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
    zIndex: isDragging ? 10 : 1,
  }

  // Update local state when link changes from store (e.g. reorder or external update)
  useEffect(() => {
    if (!isEditingTitle) setTitle(link.title || "")
    if (!isEditingUrl) setUrl(link.url || "")
  }, [link.title, link.url, isEditingTitle, isEditingUrl])

  const handleSaveTitle = async () => {
    if (title === link.title) {
      setIsEditingTitle(false)
      return
    }

    setIsSaving(true)
    try {
      await updateLink(link.id, { title })
      setIsEditingTitle(false)
      toast.success("Title updated")
    } catch (error) {
      toast.error("Failed to update title")
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveUrl = async () => {
    if (url === link.url) {
      setIsEditingUrl(false)
      setUrlError(null)
      return
    }

    const result = urlSchema.safeParse(url)
    if (!result.success) {
      setUrlError("Invalid URL")
      return
    }
    setUrlError(null)

    setIsSaving(true)
    try {
      await updateLink(link.id, { url })
      setIsEditingUrl(false)
      toast.success("URL updated")
    } catch (error) {
      toast.error("Failed to update URL")
    } finally {
      setIsSaving(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent, save: () => void, cancel: () => void) => {
    if (e.key === 'Enter') {
      save()
    } else if (e.key === 'Escape') {
      cancel()
    }
  }

  const handleToggleActive = async (checked: boolean) => {
    try {
      await toggleActive(link.id, checked)
      toast.success(checked ? "Link activated" : "Link deactivated")
    } catch (error) {
      toast.error("Failed to toggle link")
    }
  }

  const handleDelete = async () => {
    try {
      deleteLink(link.id) // Optimistic in store
      // The store handles the server call, but we might want to await it if we want to show a toast on failure
      // For now, store handles it.
      toast.success("Link deleted")
    } catch (error) {
      toast.error("Failed to delete link")
    }
  }

  const handleDuplicate = async () => {
    try {
      await duplicateLink(link)
      toast.success("Link duplicated")
      // We should probably refresh the list here or add it to the store manually
      // Since duplicateLink is a server action that revalidates path, the page might refresh
      // But for full client-side experience, we might want to add it to store.
      // For now, let's rely on revalidation or add a manual fetch.
      // Ideally, duplicateLink should return the new link and we add it to store.
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

    // Add timestamp to bust cache
    const publicUrlWithTimestamp = `${publicUrl}?t=${new Date().getTime()}`

    await updateLink(link.id, { thumbnail_url: publicUrlWithTimestamp })
    toast.success('Thumbnail updated')
  }

  const isScheduled = link.schedule_start || link.schedule_end

  return (
    <>
      <Card 
        ref={setNodeRef} 
        style={style} 
        className={cn(
          "group relative flex items-start p-4 gap-4 bg-white transition-all duration-200",
          "hover:shadow-lg hover:border-gray-300 border-gray-200 rounded-2xl",
          isDragging && "shadow-xl scale-[1.02] rotate-1 cursor-grabbing"
        )}
      >
        {/* Drag Handle */}
        <div 
          {...attributes} 
          {...listeners} 
          className="mt-2 cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-600 transition-colors p-1 rounded hover:bg-gray-100"
        >
          <GripVertical className="h-5 w-5" />
        </div>

        {/* Content */}
        <div className="flex-1 space-y-3 min-w-0">
          
          {/* Title & Badges */}
          <div className="flex flex-wrap items-center gap-2">
            {isEditingTitle ? (
              <div className="flex items-center gap-2 w-full max-w-md">
                <Input 
                  ref={titleInputRef}
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)} 
                  onBlur={handleSaveTitle}
                  onKeyDown={(e) => handleKeyDown(e, handleSaveTitle, () => {
                    setTitle(link.title || "")
                    setIsEditingTitle(false)
                  })}
                  className="h-8 font-semibold text-lg"
                  autoFocus
                />
              </div>
            ) : (
              <div 
                onClick={() => setIsEditingTitle(true)}
                className="font-bold text-gray-900 text-lg cursor-pointer hover:bg-gray-50 px-2 -ml-2 rounded transition-colors truncate"
              >
                {link.title || "Untitled Link"}
              </div>
            )}
            
            {/* Saving Indicator */}
            {isSaving && <Loader2 className="h-3 w-3 animate-spin text-gray-400" />}

            <div className="flex items-center gap-2 ml-auto sm:ml-0">
              {isScheduled && (
                <Badge variant="outline" className="text-xs gap-1 h-5 px-1.5 font-normal text-gray-500 border-gray-200">
                  <Clock className="h-3 w-3" />
                  Scheduled
                </Badge>
              )}
              
              {link.is_highlighted && (
                <Badge variant="default" className="text-xs gap-1 h-5 px-1.5 bg-amber-100 text-amber-700 hover:bg-amber-200 border-amber-200 shadow-none">
                  <Star className="h-3 w-3 fill-current" />
                  Highlighted
                </Badge>
              )}
            </div>
          </div>

          {/* URL */}
          <div className="flex items-center gap-2">
            {isEditingUrl ? (
              <div className="w-full max-w-md space-y-1">
                <Input 
                  ref={urlInputRef}
                  value={url} 
                  onChange={(e) => {
                    setUrl(e.target.value)
                    if (urlError) setUrlError(null)
                  }} 
                  onBlur={handleSaveUrl}
                  onKeyDown={(e) => handleKeyDown(e, handleSaveUrl, () => {
                    setUrl(link.url || "")
                    setIsEditingUrl(false)
                    setUrlError(null)
                  })}
                  className={cn("h-8 text-sm", urlError && "border-red-500 focus-visible:ring-red-500")}
                  placeholder="https://example.com"
                  autoFocus
                />
                {urlError && <p className="text-xs text-red-500">{urlError}</p>}
              </div>
            ) : (
              <div 
                onClick={() => setIsEditingUrl(true)}
                className="text-sm text-gray-500 cursor-pointer hover:text-gray-900 hover:bg-gray-50 px-2 -ml-2 rounded transition-colors truncate max-w-full"
              >
                {link.url || "https://"}
              </div>
            )}
          </div>

          {/* Metadata / Stats */}
          <div className="flex items-center gap-4 pt-1">
            <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-green-500/20 border border-green-500/50"></span>
              <span className="text-gray-600">{link.click_count} clicks</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col items-end gap-3">
          <Switch 
            checked={link.is_active} 
            onCheckedChange={handleToggleActive}
            className="data-[state=checked]:bg-green-600"
          />

          <div className="flex items-center gap-2">
            <label className="cursor-pointer group/thumb relative h-8 w-8 block transition-transform active:scale-95">
              <input type="file" className="hidden" accept="image/*" onChange={handleThumbnailUpload} />
              {link.thumbnail_url ? (
                <div className="relative h-8 w-8 rounded-md overflow-hidden border border-gray-200 group-hover/thumb:border-gray-400 transition-colors">
                  <Image 
                    src={link.thumbnail_url} 
                    alt="Thumbnail" 
                    fill
                    className="object-cover" 
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover/thumb:bg-black/10 transition-colors" />
                </div>
              ) : (
                <div className="h-8 w-8 rounded-md bg-gray-50 flex items-center justify-center border border-gray-200 text-gray-400 group-hover/thumb:border-gray-400 group-hover/thumb:text-gray-600 transition-all">
                  <ImageIcon className="h-4 w-4" />
                </div>
              )}
            </label>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-gray-900">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => { setIsEditingTitle(true); setTimeout(() => titleInputRef.current?.focus(), 0) }}>
                  <Pencil className="mr-2 h-4 w-4" /> Edit Title
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => { setIsEditingUrl(true); setTimeout(() => urlInputRef.current?.focus(), 0) }}>
                  <Pencil className="mr-2 h-4 w-4" /> Edit URL
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
                <DropdownMenuItem className="text-red-600 focus:text-red-600 focus:bg-red-50" onClick={handleDelete}>
                  <Trash2 className="mr-2 h-4 w-4" /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
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
