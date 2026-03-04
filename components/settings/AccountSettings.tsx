"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { updateProfile, checkUsernameAvailability } from "@/server/actions/profile"
import { Profile } from "@/types/profile"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Copy, CheckCircle2, Check, X } from "lucide-react"

const accountSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be at most 20 characters")
    .regex(/^[a-z0-9_]+$/, "Username can only contain lowercase letters, numbers, and underscores"),
})

type AccountFormValues = z.infer<typeof accountSchema>

export function AccountSettings({ profile, email }: { profile: Profile, email: string }) {
  const [isCopied, setIsCopied] = useState(false)
  const [username, setUsername] = useState(profile.username)
  const [isChecking, setIsChecking] = useState(false)
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<AccountFormValues>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      username: profile.username,
    },
  })

  const watchUsername = watch("username")

  useEffect(() => {
    const checkAvailability = async () => {
      if (!watchUsername || watchUsername === profile.username || errors.username) {
        setIsAvailable(null)
        return
      }

      setIsChecking(true)
      try {
        const available = await checkUsernameAvailability(watchUsername)
        setIsAvailable(available)
      } catch (error) {
        console.error("Failed to check username availability", error)
        setIsAvailable(null)
      } finally {
        setIsChecking(false)
      }
    }

    const timeoutId = setTimeout(checkAvailability, 500)
    return () => clearTimeout(timeoutId)
  }, [watchUsername, profile.username, errors.username])

  const onSubmit = async (data: AccountFormValues) => {
    try {
      if (data.username === profile.username) {
        toast.info("No changes made")
        return
      }
      
      if (isAvailable === false) {
        toast.error("Username is already taken")
        return
      }

      await updateProfile({ username: data.username })
      setUsername(data.username)
      setIsAvailable(null)
      toast.success("Username updated successfully")
    } catch (error: any) {
      toast.error(error.message || "Failed to update username")
    }
  }

  const handleCopy = () => {
    const url = `${window.location.origin}/${username}`
    navigator.clipboard.writeText(url)
    setIsCopied(true)
    toast.success("Profile URL copied to clipboard")
    setTimeout(() => setIsCopied(false), 2000)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Account Settings</CardTitle>
        <CardDescription>
          Manage your account details and public profile link.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label>Email Address</Label>
          <Input value={email} disabled className="bg-gray-50/50" />
          <p className="text-xs text-muted-foreground">Your email address cannot be changed here.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <div className="relative">
              <Input
                id="username"
                {...register("username")}
                placeholder="username"
                className={isAvailable === false ? "border-red-500 pr-10" : isAvailable === true ? "border-green-500 pr-10" : "pr-10"}
              />
              <div className="absolute right-3 top-2.5">
                {isChecking ? (
                  <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                ) : isAvailable === true ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : isAvailable === false ? (
                  <X className="w-4 h-4 text-red-500" />
                ) : null}
              </div>
            </div>
            {errors.username && (
              <p className="text-sm text-red-500">{errors.username.message}</p>
            )}
            {isAvailable === false && !errors.username && (
              <p className="text-sm text-red-500">This username is already taken.</p>
            )}
            {isAvailable === true && !errors.username && (
              <p className="text-sm text-green-500">This username is available!</p>
            )}
          </div>
          <Button type="submit" disabled={isSubmitting || isChecking || isAvailable === false}>
            {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Update Username
          </Button>
        </form>

        <div className="pt-4 border-t space-y-4">
          <Label>Public Profile Link</Label>
          <div className="flex items-center gap-2">
            <Input value={`${typeof window !== 'undefined' ? window.location.origin : ''}/${username}`} readOnly />
            <Button variant="secondary" onClick={handleCopy}>
              {isCopied ? <CheckCircle2 className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
              Copy
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
