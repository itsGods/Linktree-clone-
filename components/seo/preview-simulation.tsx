"use client"

import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Profile } from "@/types/profile"
import Image from "next/image"

interface PreviewSimulationProps {
  title: string
  description: string
  imageUrl: string
  username: string
}

export function PreviewSimulation({ title, description, imageUrl, username }: PreviewSimulationProps) {
  const domain = typeof window !== 'undefined' ? window.location.host : 'linktree.clone'
  const url = `https://${domain}/${username}`

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Live Preview</h3>
      
      <Tabs defaultValue="twitter" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="twitter">Twitter / X</TabsTrigger>
          <TabsTrigger value="whatsapp">WhatsApp</TabsTrigger>
        </TabsList>
        
        <TabsContent value="twitter" className="space-y-4">
          <div className="border rounded-xl overflow-hidden max-w-md mx-auto bg-white border-gray-200">
            <div className="relative aspect-[1.91/1] bg-gray-100">
              {imageUrl ? (
                <Image 
                  src={imageUrl} 
                  alt="OG Preview" 
                  fill 
                  className="object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  No Image
                </div>
              )}
            </div>
            <div className="p-3 bg-white">
              <div className="text-sm text-gray-500 mb-0.5 uppercase">{domain}</div>
              <div className="font-bold text-gray-900 truncate">{title || "Page Title"}</div>
              <div className="text-sm text-gray-500 line-clamp-2">{description || "Page description goes here..."}</div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="whatsapp" className="space-y-4">
          <div className="max-w-xs mx-auto bg-[#e5ddd5] p-4 rounded-lg">
            <div className="bg-white p-1 rounded-lg shadow-sm max-w-[80%] ml-auto relative">
              <div className="bg-[#f0f2f5] rounded overflow-hidden">
                <div className="relative aspect-[1.91/1] bg-gray-200">
                  {imageUrl ? (
                    <Image 
                      src={imageUrl} 
                      alt="OG Preview" 
                      fill 
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400 text-xs">
                      No Image
                    </div>
                  )}
                </div>
                <div className="p-2">
                  <div className="font-bold text-sm text-gray-900 truncate">{title || "Page Title"}</div>
                  <div className="text-xs text-gray-500 line-clamp-2">{description || "Page description goes here..."}</div>
                  <div className="text-xs text-gray-400 mt-1 truncate">{url}</div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  )
}
