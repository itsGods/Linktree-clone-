"use client"

import { useState, useRef } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { updateProfile } from "@/server/actions/profile"
import { Profile } from "@/types/profile"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"
import { Loader2, Image as ImageIcon } from "lucide-react"
import Image from "next/image"

const seoSchema = z.object({
  seo_title: z.string().max(60, "SEO Title must be at most 60 characters").optional(),
  seo_description: z.string().max(160, "SEO Description must be at most 160 characters").optional(),
  og_template_style: z.enum(['default', 'minimal', 'dark', 'gradient', 'glass']).optional(),
})

type SeoFormValues = z.infer<typeof seoSchema>

export function SeoSettings({ profile }: { profile: Profile }) {
  const [isUploading, setIsUploading] = useState(false)
  const [ogImageUrl, setOgImageUrl] = useState(profile.og_image_url)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<SeoFormValues>({
    resolver: zodResolver(seoSchema),
    defaultValues: {
      seo_title: profile.seo_title || "",
      seo_description: profile.seo_description || "",
      og_template_style: profile.og_template_style || "default",
    },
  })

  const titleValue = watch("seo_title") || ""
  const descriptionValue = watch("seo_description") || ""
  const templateStyle = watch("og_template_style")

  const handleFileSelect = (file: File) => {
    if (!file.type.includes("image")) {
      toast.error("Please upload an image file")
      return
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be less than 2MB")
      return
    }

    setSelectedFile(file)
    setPreviewUrl(URL.createObjectURL(file))
  }

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleFileSelect(file)
  }

  const onSubmit = async (data: SeoFormValues) => {
    try {
      let finalOgImageUrl = ogImageUrl

      if (selectedFile) {
        setIsUploading(true)
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error("Not authenticated")

        const fileExt = selectedFile.name.split('.').pop()
        const filePath = `${user.id}-og-${Math.random()}.${fileExt}`

        const { error: uploadError } = await supabase.storage
          .from('avatars') // Reusing avatars bucket for simplicity, or we could use 'og-images'
          .upload(filePath, selectedFile)

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath)

        finalOgImageUrl = publicUrl
        setOgImageUrl(publicUrl)
        setSelectedFile(null)
        setPreviewUrl(null)
      }

      await updateProfile({
        seo_title: data.seo_title,
        seo_description: data.seo_description,
        og_template_style: data.og_template_style,
        og_image_url: finalOgImageUrl || undefined,
      })
      toast.success("SEO settings saved successfully")
    } catch (error: any) {
      toast.error(error.message || "Failed to save SEO settings")
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>SEO & Social Preview</CardTitle>
        <CardDescription>
          Customize how your profile appears on search engines and social media.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="seo_title">SEO Title</Label>
                  <span className="text-xs text-muted-foreground">
                    {titleValue.length} / 60
                  </span>
                </div>
                <Input
                  id="seo_title"
                  {...register("seo_title")}
                  placeholder="e.g. John Doe | Creator"
                />
                {errors.seo_title && (
                  <p className="text-sm text-red-500">{errors.seo_title.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="seo_description">SEO Description</Label>
                  <span className="text-xs text-muted-foreground">
                    {descriptionValue.length} / 160
                  </span>
                </div>
                <Textarea
                  id="seo_description"
                  {...register("seo_description")}
                  placeholder="A brief description of who you are and what you do."
                  className="resize-none"
                  rows={3}
                />
                {errors.seo_description && (
                  <p className="text-sm text-red-500">{errors.seo_description.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>OG Image (Social Preview Image)</Label>
                <div 
                  className={`relative w-full aspect-video rounded-lg border-2 border-dashed flex items-center justify-center overflow-hidden transition-colors ${isDragging ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'}`}
                  onDragOver={onDragOver}
                  onDragLeave={onDragLeave}
                  onDrop={onDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {previewUrl || ogImageUrl ? (
                    <Image src={previewUrl || ogImageUrl || ""} alt="OG Preview" fill className="object-cover" unoptimized />
                  ) : (
                    <div className="flex flex-col items-center text-muted-foreground">
                      <ImageIcon className="w-8 h-8 mb-2 opacity-50" />
                      <span className="text-sm text-center px-2">Drag & Drop or Click to upload</span>
                      <span className="text-xs text-center px-2 mt-1">Recommended: 1200x630px</span>
                    </div>
                  )}
                  {isUploading && (
                    <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                      <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    </div>
                  )}
                </div>
                <Input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleFileSelect(file)
                  }}
                />
                {selectedFile && (
                  <div className="flex justify-end mt-2">
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => {
                        setSelectedFile(null)
                        setPreviewUrl(null)
                      }}
                    >
                      Cancel Upload
                    </Button>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="og_template_style">Social Preview Template</Label>
                <Select 
                  value={templateStyle} 
                  onValueChange={(value: any) => setValue("og_template_style", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a template" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Default</SelectItem>
                    <SelectItem value="minimal">Minimal</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="gradient">Gradient</SelectItem>
                    <SelectItem value="glass">Glass</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Live Preview Card */}
            <div className="space-y-4">
              <Label>Live Preview (Twitter/X, Discord, WhatsApp)</Label>
              <div className="border rounded-xl overflow-hidden shadow-sm bg-card">
                <div className="aspect-video bg-muted relative border-b">
                  {(previewUrl || ogImageUrl) ? (
                    <Image src={previewUrl || ogImageUrl || ""} alt="Preview" fill className="object-cover" unoptimized />
                  ) : (
                    <div className={`w-full h-full flex items-center justify-center ${
                      templateStyle === 'dark' ? 'bg-zinc-900 text-white' :
                      templateStyle === 'gradient' ? 'bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white' :
                      templateStyle === 'glass' ? 'bg-slate-100' :
                      templateStyle === 'minimal' ? 'bg-white text-black' :
                      'bg-slate-100 text-slate-900'
                    }`}>
                      <div className="text-center p-6">
                        <h3 className="text-2xl font-bold mb-2">{titleValue || profile.display_name || profile.username}</h3>
                        <p className="opacity-80 line-clamp-2">{descriptionValue || profile.bio || "Check out my links!"}</p>
                      </div>
                    </div>
                  )}
                </div>
                <div className="p-4 bg-muted/30">
                  <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">
                    {typeof window !== 'undefined' ? window.location.hostname : 'creatorlink.com'}
                  </p>
                  <h4 className="font-semibold text-sm line-clamp-1">
                    {titleValue || profile.display_name || profile.username}
                  </h4>
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                    {descriptionValue || profile.bio || "Check out my links!"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting || isUploading}>
              {(isSubmitting || isUploading) && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save SEO Settings
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
