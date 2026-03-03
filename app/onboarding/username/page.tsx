"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Loader2, Check, X } from "lucide-react"
import { toast } from "sonner"

const usernameSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be at most 20 characters")
    .regex(/^[a-z0-9_]+$/, "Only lowercase letters, numbers, and underscores allowed"),
})

type UsernameFormValues = z.infer<typeof usernameSchema>

export default function UsernamePage() {
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(false)
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const form = useForm<UsernameFormValues>({
    resolver: zodResolver(usernameSchema),
    defaultValues: {
      username: "",
    },
    mode: "onChange",
  })

  const watchedUsername = form.watch("username")

  useEffect(() => {
    const checkAvailability = async () => {
      if (!watchedUsername || watchedUsername.length < 3) {
        setIsAvailable(null)
        setIsChecking(false)
        return
      }

      setIsChecking(true)
      const supabase = createClient()
      
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Check if username exists and is NOT the current user's
      const { data, error } = await supabase
        .from("profiles")
        .select("id")
        .eq("username", watchedUsername)
        .neq("id", user.id) // Exclude current user
        .single()

      if (error && error.code === "PGRST116") {
        // PGRST116 means no rows found, so username is available
        setIsAvailable(true)
      } else if (data) {
        // Username exists and belongs to someone else
        setIsAvailable(false)
      } else {
        // Some other error or username taken
        setIsAvailable(false)
      }
      setIsChecking(false)
    }

    const debounce = setTimeout(checkAvailability, 500)
    return () => clearTimeout(debounce)
  }, [watchedUsername])

  const onSubmit = async (data: UsernameFormValues) => {
    if (!isAvailable) return

    setIsSaving(true)
    const supabase = createClient()
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        toast.error("You must be logged in")
        return
      }

      const { error } = await supabase
        .from("profiles")
        .update({ username: data.username })
        .eq("id", user.id)

      if (error) throw error

      router.push("/onboarding/theme")
    } catch (error) {
      console.error(error)
      toast.error("Failed to save username")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold tracking-tight">Claim your Linktree</h1>
        <p className="text-muted-foreground">
          Choose a unique username for your profile.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input 
                      placeholder="username" 
                      {...field} 
                      className={isAvailable === true ? "border-green-500 focus-visible:ring-green-500" : isAvailable === false ? "border-red-500 focus-visible:ring-red-500" : ""}
                    />
                    <div className="absolute right-3 top-2.5">
                      {isChecking ? (
                        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                      ) : isAvailable === true ? (
                        <Check className="h-5 w-5 text-green-500" />
                      ) : isAvailable === false ? (
                        <X className="h-5 w-5 text-red-500" />
                      ) : null}
                    </div>
                  </div>
                </FormControl>
                <FormMessage />
                {isAvailable === false && (
                  <p className="text-sm font-medium text-destructive">
                    Username is already taken
                  </p>
                )}
              </FormItem>
            )}
          />

          <Button 
            type="submit" 
            className="w-full" 
            disabled={!isAvailable || isChecking || isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Continue"
            )}
          </Button>
        </form>
      </Form>
    </div>
  )
}
