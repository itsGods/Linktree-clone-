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
          "group relative flex flex-col bg-white transition duration-150",
          "rounded-xl border border-gray-200 shadow-sm p-4 hover:shadow-md",
          isDragging && "shadow-xl scale-[1.02] rotate-1 cursor-grabbing"
        )}
      >
        {/* Top Row: drag handle, icon, title, menu button */}
        <div className="flex items-center gap-3 w-full">
          {/* Drag Handle */}
          <div 
            {...attributes} 
            {...listeners} 
            className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 transition-colors"
          >
            <GripVertical className="h-5 w-5" />
          </div>

          {/* Icon */}
          <label className="cursor-pointer group/thumb relative h-10 w-10 shrink-0 block transition-transform active:scale-95">
            <input type="file" className="hidden" accept="image/*" onChange={handleThumbnailUpload} />
            {link.thumbnail_url ? (
              <div className="relative h-10 w-10 rounded-lg overflow-hidden border border-gray-200 group-hover/thumb:border-gray-400 transition-colors">
                <Image 
                  src={link.thumbnail_url} 
                  alt="Thumbnail" 
                  fill
                  className="object-cover" 
                />
                <div className="absolute inset-0 bg-black/0 group-hover/thumb:bg-black/10 transition-colors" />
              </div>
            ) : (
              <div className="h-10 w-10 rounded-lg bg-gray-50 flex items-center justify-center border border-gray-200 text-gray-400 group-hover/thumb:border-gray-400 group-hover/thumb:text-gray-600 transition-all">
                <ImageIcon className="h-5 w-5" />
              </div>
            )}
          </label>

          {/* Title & URL */}
          <div className="flex-1 min-w-0 flex flex-col justify-center">
            <div className="flex items-center gap-2">
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
                    className="h-7 font-semibold text-base px-2"
                    autoFocus
                  />
                </div>
              ) : (
                <div 
                  onClick={() => setIsEditingTitle(true)}
                  className="font-semibold text-gray-900 text-base cursor-pointer hover:bg-gray-50 px-1 -ml-1 rounded transition-colors truncate"
                >
                  {link.title || "Untitled Link"}
                </div>
              )}
              {isSaving && <Loader2 className="h-3 w-3 animate-spin text-gray-400" />}
            </div>

            {/* URL Row */}
            <div className="flex items-center gap-2 mt-0.5">
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
                    className={cn("h-6 text-sm px-2", urlError && "border-red-500 focus-visible:ring-red-500")}
                    placeholder="https://example.com"
                    autoFocus
                  />
                  {urlError && <p className="text-xs text-red-500">{urlError}</p>}
                </div>
              ) : (
                <div 
                  onClick={() => setIsEditingUrl(true)}
                  className="text-sm text-gray-500 cursor-pointer hover:text-gray-900 hover:bg-gray-50 px-1 -ml-1 rounded transition-colors truncate max-w-full"
                >
                  {link.url || "https://"}
                </div>
              )}
            </div>
          </div>

          {/* Menu Button */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-gray-900 shrink-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => { setIsEditingTitle(true); setTimeout(() => titleInputRef.current?.focus(), 0) }}>
                <Pencil className="mr-2 h-4 w-4" /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDuplicate}>
                <Copy className="mr-2 h-4 w-4" /> Duplicate
              </DropdownMenuItem>
              <DropdownMenuItem className="text-red-600 focus:text-red-600 focus:bg-red-50" onClick={handleDelete}>
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Bottom Row */}
        <div className="flex items-center justify-between mt-4">
          {/* Left side: click count & badges */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
              <span className="text-[10px]">●</span>
              <span>{link.click_count} click{link.click_count !== 1 ? 's' : ''}</span>
            </div>
            
            {isScheduled && (
              <Badge variant="outline" className="text-[10px] gap-1 h-4 px-1.5 font-normal text-gray-500 border-gray-200">
                <Clock className="h-2.5 w-2.5" />
                Scheduled
              </Badge>
            )}
            
            {link.is_highlighted && (
              <Badge variant="default" className="text-[10px] gap-1 h-4 px-1.5 bg-amber-100 text-amber-700 hover:bg-amber-200 border-amber-200 shadow-none">
                <Star className="h-2.5 w-2.5 fill-current" />
                Highlighted
              </Badge>
            )}
          </div>

          {/* Right side: toggle switch */}
          <Switch 
            checked={link.is_active} 
            onCheckedChange={handleToggleActive}
            className="data-[state=checked]:bg-green-600 h-5 w-9 [&_span]:h-4 [&_span]:w-4 [&_span]:data-[state=checked]:translate-x-4"
          />
        </div>
      </Card>
    </>
  )
}
