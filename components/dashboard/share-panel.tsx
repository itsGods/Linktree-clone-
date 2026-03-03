"use client"

import { useState, useEffect } from "react"
import { Copy, ExternalLink, Share2, QrCode, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

interface SharePanelProps {
  username: string
}

export function SharePanel({ username }: SharePanelProps) {
  const [copied, setCopied] = useState(false)
  const [origin, setOrigin] = useState("")

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin)
    }
  }, [])

  const url = origin ? `${origin}/${username}` : `/${username}`

  const handleCopy = () => {
    navigator.clipboard.writeText(url)
    setCopied(true)
    toast.success("Copied to clipboard")
    setTimeout(() => setCopied(false), 2000)
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Check out my Linktree Clone: @${username}`,
          url: url,
        })
      } catch (error) {
        console.error("Error sharing:", error)
      }
    } else {
      handleCopy()
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 w-full sm:w-auto overflow-hidden">
        <div className="text-sm font-medium text-gray-500 whitespace-nowrap">
          Your Linktree Clone is live:
        </div>
        <a 
          href={`/${username}`} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-sm font-semibold text-gray-900 hover:underline truncate max-w-full sm:max-w-[300px]"
        >
          {origin ? `${origin}/${username}` : `.../${username}`}
        </a>
      </div>

      <div className="flex items-center gap-2 w-full sm:w-auto">
        <Button variant="outline" size="sm" onClick={handleCopy} className="flex-1 sm:flex-none">
          {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
          Copy
        </Button>
        <Button variant="outline" size="sm" onClick={handleShare} className="flex-1 sm:flex-none">
          <Share2 className="h-4 w-4 mr-2" />
          Share
        </Button>
        <Button variant="outline" size="icon" className="hidden sm:flex" title="QR Code">
          <QrCode className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" asChild className="hidden sm:flex" title="Open">
          <a href={`/${username}`} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="h-4 w-4" />
          </a>
        </Button>
      </div>
    </div>
  )
}
