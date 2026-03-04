"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Globe } from "lucide-react"

export function DomainSettings() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Custom Domain</CardTitle>
        <CardDescription>
          Connect a custom domain to your profile (e.g., links.mydomain.com).
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="custom_domain">Domain Name</Label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Globe className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="custom_domain"
                placeholder="links.mydomain.com"
                className="pl-9"
                disabled
              />
            </div>
            <Button disabled>Connect</Button>
          </div>
        </div>
        
        <div className="bg-blue-50 text-blue-800 p-4 rounded-lg text-sm flex items-start gap-3">
          <div className="bg-blue-100 p-1 rounded-full mt-0.5">
            <Globe className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <p className="font-semibold mb-1">Custom domains coming soon.</p>
            <p className="opacity-90">We are currently working on adding support for custom domains. Check back later for updates!</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
