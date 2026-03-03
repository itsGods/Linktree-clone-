"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { Loader2, Save, Upload, X } from "lucide-react"
import Image from "next/image"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

import { updateProfile, getProfile } from "@/server/actions/profile"
import { createClient } from "@/lib/supabase/client"
import { PreviewSimulation } from "@/components/seo/preview-simulation"
import { Profile } from "@/types/profile"

const seoFormSchema = z.object({
  seo_title: z.string().max(60, "Title must be less than 60 characters").optional(),
  seo_description: z.string().max(160, "Description must be less than 160 characters").optional(),
  og_image_url: z.string().optional(),
  og_template_style: z.enum(['default', 'minimal', 'dark', 'gradient', 'glass']),
})

type SeoFormValues = z.infer<typeof seoFormSchema>

export default function SeoSettingsPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [uploading, setUploading] = useState(false)

  const form = useForm<SeoFormValues>({
    resolver: zodResolver(seoFormSchema),
    defaultValues: {
      seo_title: "",
      seo_description: "",
      og_image_url: "",
      og_template_style: "default",
    },
  })

  useEffect(() => {
    async function loadProfile() {
      try {
        const data = await getProfile()
        if (data) {
          setProfile(data)
          form.reset({
            seo_title: data.seo_title || "",
            seo_description: data.seo_description || "",
            og_image_url: data.og_image_url || "",
            og_template_style: data.og_template_style || "default",
          })
        }
      } catch (error) {
        toast.error("Failed to load profile settings")
      } finally {
        setIsLoading(false)
      }
    }

    loadProfile()
  }, [form])

  async function onSubmit(data: SeoFormValues) {
    setIsSaving(true)
    try {
      await updateProfile(data)
      toast.success("SEO settings saved")
      
      // Update local profile state to reflect changes immediately in preview
      if (profile) {
        setProfile({ ...profile, ...data })
      }
    } catch (error) {
      toast.error("Failed to save settings")
    } finally {
      setIsSaving(false)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB")
      return
    }

    setUploading(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) throw new Error("Unauthorized")

      const fileExt = file.name.split('.').pop()
      const fileName = `og-${Date.now()}.${fileExt}`
      const filePath = `${user.id}/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('thumbnails') // Reusing thumbnails bucket for now
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('thumbnails')
        .getPublicUrl(filePath)

      form.setValue("og_image_url", publicUrl, { shouldDirty: true })
      toast.success("Image uploaded successfully")
    } catch (error) {
      console.error(error)
      toast.error("Failed to upload image")
    } finally {
      setUploading(false)
    }
  }

  const watchedValues = form.watch()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">SEO & Social Sharing</h1>
        <p className="text-gray-500 mt-2">
          Customize how your profile appears on search engines and social media.
        </p>
      </div>
      
      <Separator />

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Metadata</CardTitle>
                  <CardDescription>
                    These settings affect how your link appears in search results.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="seo_title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>SEO Title</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input placeholder={profile?.display_name || "My Linktree"} {...field} />
                            <div className="absolute right-2 top-2.5 text-xs text-gray-400">
                              {field.value?.length || 0}/60
                            </div>
                          </div>
                        </FormControl>
                        <FormDescription>
                          Recommended length: 50-60 characters
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="seo_description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>SEO Description</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Textarea 
                              placeholder={profile?.bio || "Check out my links..."} 
                              className="resize-none h-24" 
                              {...field} 
                            />
                            <div className="absolute right-2 bottom-2 text-xs text-gray-400">
                              {field.value?.length || 0}/160
                            </div>
                          </div>
                        </FormControl>
                        <FormDescription>
                          Recommended length: 150-160 characters
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Open Graph Image</CardTitle>
                  <CardDescription>
                    Customize the image shown when your link is shared.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="og_image_url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Custom Image</FormLabel>
                        <FormControl>
                          <div className="space-y-4">
                            {field.value && (
                              <div className="relative aspect-video w-full overflow-hidden rounded-lg border bg-gray-100">
                                <Image
                                  src={field.value}
                                  alt="OG Image"
                                  fill
                                  className="object-cover"
                                />
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="icon"
                                  className="absolute right-2 top-2 h-8 w-8"
                                  onClick={() => field.onChange("")}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            )}
                            <div className="flex items-center gap-4">
                              <Button
                                type="button"
                                variant="outline"
                                disabled={uploading}
                                onClick={() => document.getElementById('og-upload')?.click()}
                              >
                                {uploading ? (
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                  <Upload className="mr-2 h-4 w-4" />
                                )}
                                Upload Image
                              </Button>
                              <input
                                id="og-upload"
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleImageUpload}
                              />
                              <p className="text-xs text-gray-500">
                                Recommended: 1200x630px
                              </p>
                            </div>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="og_template_style"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Auto-Generated Template</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a style" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="default">Default</SelectItem>
                            <SelectItem value="minimal">Minimal</SelectItem>
                            <SelectItem value="dark">Dark Mode</SelectItem>
                            <SelectItem value="gradient">Gradient</SelectItem>
                            <SelectItem value="glass">Glassmorphism</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Used if no custom image is provided.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <div className="flex justify-end">
                <Button type="submit" disabled={isSaving}>
                  {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
              </div>
            </form>
          </Form>
        </div>

        <div className="space-y-6">
          <div className="sticky top-6">
            <PreviewSimulation
              title={watchedValues.seo_title || profile?.display_name || "My Linktree"}
              description={watchedValues.seo_description || profile?.bio || "Check out my links..."}
              imageUrl={watchedValues.og_image_url || (profile?.username ? `/api/og?username=${profile.username}&style=${watchedValues.og_template_style}` : "")}
              username={profile?.username || "username"}
            />
            
            <div className="mt-6 p-4 bg-blue-50 text-blue-800 rounded-lg text-sm">
              <p className="font-semibold mb-1">Pro Tip</p>
              <p>
                Social platforms cache these images. If you update your image, use the 
                <a href="https://cards-dev.twitter.com/validator" target="_blank" rel="noopener noreferrer" className="underline ml-1">
                  Twitter Card Validator
                </a> or 
                <a href="https://developers.facebook.com/tools/debug/" target="_blank" rel="noopener noreferrer" className="underline ml-1">
                  Facebook Debugger
                </a> to refresh the cache.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
