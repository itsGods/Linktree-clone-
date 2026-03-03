"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { motion, AnimatePresence } from "motion/react"

interface SmartCTAProps {
  username: string
  profileId: string
}

export function SmartCTA({ username, profileId }: SmartCTAProps) {
  const pathname = usePathname()
  const [showCTA, setShowCTA] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function checkOwnership() {
      // Always show in admin preview
      if (pathname === "/admin/preview") {
        setShowCTA(true)
        setLoading(false)
        return
      }

      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      // If no user is logged in, show CTA
      if (!user) {
        setShowCTA(true)
        setLoading(false)
        return
      }

      // If user is logged in, check if they own this profile
      if (user.id === profileId) {
        setShowCTA(false)
      } else {
        setShowCTA(true)
      }
      setLoading(false)
    }

    checkOwnership()
  }, [pathname, profileId])

  if (loading) return null

  return (
    <AnimatePresence>
      {showCTA && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="fixed bottom-6 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none"
        >
          <Link 
            href="/"
            className="pointer-events-auto bg-white dark:bg-gray-900 text-gray-900 dark:text-white px-6 py-3 rounded-full shadow-lg border border-gray-200 dark:border-gray-800 font-medium text-sm hover:scale-105 transition-transform flex items-center gap-2"
          >
            <span>Join {username} on Linktree Clone</span>
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
