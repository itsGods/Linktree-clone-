"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Loader2, ArrowRight } from "lucide-react"
import { toast } from "sonner"
import { MobilePreviewFrame } from "@/components/MobilePreviewFrame"
import { PublicProfile } from "@/components/PublicProfile"
import { ShareExperience } from "@/components/ShareExperience"
import { Profile } from "@/types/profile"
import { Link as LinkType } from "@/types/links"

export default function CompletePage() {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [links, setLinks] = useState<LinkType[]>([])
  const [loading, setLoading] = useState(true)
  const [finishing, setFinishing] = useState(false)

  useEffect(() => {
    async function loadProfile() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push("/login")
        return
      }

      const { data } = await supabase
        .from("profiles")
        .select("*, themes(*)")
        .eq("id", user.id)
        .single()

      if (data) {
        setProfile(data)
        // Fetch links if any (probably none yet, but good to have)
        const { data: linksData } = await supabase
          .from("links")
          .select("*")
          .eq("profile_id", user.id)
          .order("position", { ascending: true })
        
        if (linksData) setLinks(linksData)
      }
      setLoading(false)
    }

    loadProfile()
  }, [router])

  const handleFinish = async () => {
    setFinishing(true)
    const supabase = createClient()
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) return

      const { error } = await supabase
        .from("profiles")
        .update({ onboarding_complete: true })
        .eq("id", user.id)

      if (error) throw error

      router.push("/admin")
      toast.success("Welcome to your dashboard!")
    } catch (error) {
      console.error(error)
      toast.error("Failed to complete onboarding")
    } finally {
      setFinishing(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  if (!profile) return null

  return (
    <div className="flex flex-col items-center space-y-8 w-full max-w-4xl">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">You&apos;re all set! 🎉</h1>
        <p className="text-muted-foreground">
          Your profile is ready to share with the world.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-12 items-center justify-center w-full">
        {/* Preview */}
        <div className="scale-90 md:scale-100 origin-top">
          <MobilePreviewFrame username={profile.username}>
            <PublicProfile profile={profile} links={links} isPreview={true} />
          </MobilePreviewFrame>
        </div>

        {/* Actions */}
        <div className="space-y-6 max-w-sm w-full">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm space-y-4">
            <h3 className="font-semibold text-lg">Share your Linktree</h3>
            <ShareExperience username={profile.username} />
          </div>

          <Button 
            onClick={handleFinish} 
            className="w-full h-12 text-lg" 
            size="lg"
            disabled={finishing}
          >
            {finishing ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <>
                Go to Dashboard
                <ArrowRight className="ml-2 h-5 w-5" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
