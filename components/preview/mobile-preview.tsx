"use client"

import { useLinkEditorStore } from "@/store/linkEditorStore"
import { LinkRenderer } from "@/components/links/renderers"
import { motion, AnimatePresence } from "motion/react"
import { Phone } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface MobilePreviewProps {
  user: {
    username: string
    display_name?: string | null
    bio?: string | null
    avatar_url?: string | null
  }
}

export function MobilePreview({ user }: MobilePreviewProps) {
  const links = useLinkEditorStore((state) => state.links)

  // Filter active links for preview (or show all with opacity if inactive? usually preview shows what public sees)
  // The prompt says "Render actual public link components". Public only sees active links.
  // But for admin preview, maybe we want to see what it *would* look like?
  // Let's show active links only to be true to "Live Preview".
  const activeLinks = links.filter(link => link.is_active)

  return (
    <div className="flex flex-col items-center justify-center h-full w-full py-8">
      <div className="relative w-full max-w-[300px] h-[600px] bg-white rounded-[3rem] border-8 border-gray-900 shadow-2xl overflow-hidden shrink-0">
        {/* Notch */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-gray-900 rounded-b-xl z-20"></div>
        
        {/* Screen Content */}
        <div className="w-full h-full overflow-y-auto no-scrollbar bg-white pb-20">
          <div className="flex flex-col items-center pt-12 px-4 space-y-6">
            
            {/* Profile Header */}
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="w-20 h-20 rounded-full border-2 border-gray-100 p-0.5">
                <Avatar className="w-full h-full">
                  <AvatarImage src={user.avatar_url || undefined} alt={user.username} className="object-cover" />
                  <AvatarFallback className="text-2xl font-bold text-gray-400 bg-gray-100">
                    {user.username[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div>
                <h2 className="font-bold text-lg">{user.display_name || `@${user.username}`}</h2>
                {user.bio && <p className="text-sm text-gray-500 mt-1">{user.bio}</p>}
              </div>
            </div>

            {/* Links */}
            <div className="w-full space-y-4">
              <AnimatePresence mode="popLayout">
                {activeLinks.map((link) => (
                  <motion.div
                    key={link.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.2 }}
                  >
                    <LinkRenderer link={link} />
                  </motion.div>
                ))}
              </AnimatePresence>

              {activeLinks.length === 0 && (
                <div className="text-center py-8 text-gray-400 text-sm">
                  <p>Add active links to see them here</p>
                </div>
              )}
            </div>

            {/* Branding */}
            <div className="pt-8 pb-4">
               <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">Linktree Clone</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
