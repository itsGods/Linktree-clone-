"use client"

import { Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { MobilePreview } from "./mobile-preview"

interface MobilePreviewToggleProps {
  user: {
    username: string
    display_name?: string | null
    bio?: string | null
    avatar_url?: string | null
  }
}

export function MobilePreviewToggle({ user }: MobilePreviewToggleProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button 
          className="fixed bottom-6 right-6 z-50 rounded-full shadow-xl lg:hidden h-14 w-14" 
          size="icon"
        >
          <Eye className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="h-[85vh] rounded-t-[2rem] p-0 border-t-0 bg-gray-50">
        <div className="sr-only">
          <SheetTitle>Mobile Preview</SheetTitle>
        </div>
        <div className="h-full w-full pt-4 flex items-center justify-center">
          <MobilePreview user={user} />
        </div>
      </SheetContent>
    </Sheet>
  )
}
