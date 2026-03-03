"use client"

import { useEffect } from "react"

export function PageViewTracker({ profileId }: { profileId: string }) {
  useEffect(() => {
    // Fire page view event
    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        profile_id: profileId,
        event_type: "page_view",
        referrer: document.referrer
      })
    }).catch(console.error)
  }, [profileId])

  return null
}
