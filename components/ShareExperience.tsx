"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { Copy, Share2, QrCode, Check } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { QRCodeSVG } from "qrcode.react"

interface ShareExperienceProps {
  username: string
}

export function ShareExperience({ username }: ShareExperienceProps) {
  const [copied, setCopied] = useState(false)
  const url = `${typeof window !== "undefined" ? window.location.origin : ""}/${username}`

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      toast.success("Link copied to clipboard!")
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      toast.error("Failed to copy link")
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Check out ${username}'s links`,
          text: `Check out ${username}'s links on Linktree Clone`,
          url: url,
        })
      } catch (err) {
        console.error("Error sharing:", err)
      }
    } else {
      handleCopy()
    }
  }

  return (
    <div className="flex items-center gap-2 mt-6">
      <div className="flex-1 relative">
        <Input 
          readOnly 
          value={url} 
          className="pr-24 bg-white dark:bg-gray-950"
        />
        <div className="absolute right-1 top-1 bottom-1 flex gap-1">
          <Button 
            size="sm" 
            variant="ghost" 
            className="h-full px-2 hover:bg-gray-100 dark:hover:bg-gray-800"
            onClick={handleCopy}
          >
            {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
          </Button>
        </div>
      </div>
      
      <Button onClick={handleShare} variant="outline" size="icon">
        <Share2 className="w-4 h-4" />
      </Button>

      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" size="icon">
            <QrCode className="w-4 h-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Share QR Code</DialogTitle>
            <DialogDescription>
              Scan this code to visit your profile instantly.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center p-6 bg-white rounded-lg border border-gray-100 shadow-sm">
            <QRCodeSVG value={url} size={200} />
          </div>
          <div className="flex justify-center">
            <Button variant="secondary" onClick={() => window.print()}>
              Print QR Code
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
