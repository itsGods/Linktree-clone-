"use client"

import { useAppearanceStore } from "@/store/appearance-store"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { useState } from "react"
import { Loader2 } from "lucide-react"

export function ProfileEditor() {
  const { profile, updateProfile } = useAppearanceStore()
  const [isUploading, setIsUploading] = useState(false)

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const fileExt = file.name.split('.').pop()
      const filePath = `${user.id}/avatar.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true })

      if (uploadError) {
        throw uploadError
      }

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      // Add a timestamp to bust cache
      const publicUrlWithTimestamp = `${publicUrl}?t=${new Date().getTime()}`

      updateProfile({ avatar_url: publicUrlWithTimestamp })
      toast.success('Avatar uploaded!')
    } catch (error: any) {
      toast.error('Error uploading avatar: ' + error.message)
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemoveAvatar = () => {
    updateProfile({ avatar_url: null })
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <Label>Profile Picture</Label>
        <div className="flex items-center gap-4">
          <Avatar className="h-24 w-24 border">
            <AvatarImage src={profile?.avatar_url || ""} />
            <AvatarFallback>{profile?.display_name?.[0] || "U"}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-2">
            <div className="relative">
              <Button variant="outline" size="sm" disabled={isUploading}>
                {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Upload Image
              </Button>
              <Input 
                type="file" 
                accept="image/*"
                className="absolute inset-0 opacity-0 cursor-pointer"
                onChange={handleAvatarUpload}
                disabled={isUploading}
              />
            </div>
            {profile?.avatar_url && (
              <Button variant="ghost" size="sm" onClick={handleRemoveAvatar} className="text-red-500 hover:text-red-600 hover:bg-red-50">
                Remove
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="display_name">Profile Title</Label>
        <Input 
          id="display_name" 
          value={profile?.display_name || ""} 
          onChange={(e) => updateProfile({ display_name: e.target.value })}
          placeholder="@username"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="bio">Bio</Label>
        <Textarea 
          id="bio" 
          value={profile?.bio || ""} 
          onChange={(e) => updateProfile({ bio: e.target.value })}
          placeholder="Tell visitors about yourself"
          className="resize-none h-24"
          maxLength={80}
        />
        <div className="text-xs text-right text-muted-foreground">
          {profile?.bio?.length || 0}/80
        </div>
      </div>
    </div>
  )
}
