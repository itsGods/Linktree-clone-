"use client"

import { useAppearanceStore } from "@/store/appearance-store"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { Upload } from "lucide-react"
import Image from "next/image"

export function BackgroundEditor() {
  const { customAppearance, updateCustom } = useAppearanceStore()

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateCustom({ 
      background_type: 'solid', 
      background_value: e.target.value 
    })
  }

  const handleGradientChange = (start: string, end: string, direction: string) => {
    updateCustom({
      background_type: 'gradient',
      gradient_start: start,
      gradient_end: end,
      gradient_direction: direction
    })
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const fileExt = file.name.split('.').pop()
    const filePath = `${user.id}/${Date.now()}.${fileExt}`

    const { error } = await supabase.storage
      .from('backgrounds')
      .upload(filePath, file)

    if (error) {
      toast.error("Upload failed")
      return
    }

    const { data: { publicUrl } } = supabase.storage
      .from('backgrounds')
      .getPublicUrl(filePath)

    updateCustom({
      background_type: 'image',
      background_image_url: publicUrl
    })
    toast.success("Background uploaded")
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="color" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="color">Color</TabsTrigger>
          <TabsTrigger value="gradient">Gradient</TabsTrigger>
          <TabsTrigger value="image">Image</TabsTrigger>
        </TabsList>
        
        <TabsContent value="color" className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label>Background Color</Label>
            <div className="flex gap-2">
              <Input 
                type="color" 
                value={customAppearance.background_value || '#ffffff'}
                onChange={handleColorChange}
                className="w-12 h-12 p-1 cursor-pointer"
              />
              <Input 
                type="text" 
                value={customAppearance.background_value || '#ffffff'}
                onChange={handleColorChange}
                className="flex-1"
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="gradient" className="space-y-4 pt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Color</Label>
              <Input 
                type="color" 
                value={customAppearance.gradient_start || '#ffffff'}
                onChange={(e) => handleGradientChange(e.target.value, customAppearance.gradient_end || '#000000', customAppearance.gradient_direction || 'to bottom')}
                className="w-full h-10 p-1"
              />
            </div>
            <div className="space-y-2">
              <Label>End Color</Label>
              <Input 
                type="color" 
                value={customAppearance.gradient_end || '#000000'}
                onChange={(e) => handleGradientChange(customAppearance.gradient_start || '#ffffff', e.target.value, customAppearance.gradient_direction || 'to bottom')}
                className="w-full h-10 p-1"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Direction</Label>
            <div className="grid grid-cols-4 gap-2">
              {['to bottom', 'to top', 'to right', 'to left', 'to bottom right', 'to top left'].map((dir) => (
                <button
                  key={dir}
                  className={`p-2 text-xs border rounded hover:bg-gray-50 ${customAppearance.gradient_direction === dir ? 'bg-gray-100 border-black' : ''}`}
                  onClick={() => handleGradientChange(customAppearance.gradient_start || '#fff', customAppearance.gradient_end || '#000', dir)}
                >
                  {dir.replace('to ', '')}
                </button>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="image" className="space-y-4 pt-4">
          <div className="border-2 border-dashed rounded-lg p-8 text-center hover:bg-gray-50 transition-colors">
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              id="bg-upload"
              onChange={handleImageUpload}
            />
            <label htmlFor="bg-upload" className="cursor-pointer flex flex-col items-center gap-2">
              <Upload className="h-8 w-8 text-gray-400" />
              <span className="text-sm font-medium text-gray-600">Click to upload image</span>
              <span className="text-xs text-gray-400">JPG, PNG, GIF up to 5MB</span>
            </label>
          </div>
          
          {customAppearance.background_image_url && (
            <div className="relative aspect-video rounded-lg overflow-hidden border">
              <Image 
                src={customAppearance.background_image_url} 
                alt="Background preview" 
                fill
                className="object-cover"
              />
              <Button 
                variant="destructive" 
                size="sm" 
                className="absolute top-2 right-2"
                onClick={() => updateCustom({ background_image_url: null, background_type: 'solid' })}
              >
                Remove
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
