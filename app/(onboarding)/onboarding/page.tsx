"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Loader2, CheckCircle2, XCircle } from "lucide-react"
import { toast } from "sonner"
import { useDebounce } from "@/hooks/use-debounce"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { createClient } from "@/lib/supabase/client"
import { profileSchema } from "@/lib/validators/profile"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

// Step 1: Username
// Step 2: Profile Details
// Step 3: Save

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [isCheckingUsername, setIsCheckingUsername] = useState(false)
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: "",
      display_name: "",
      bio: "",
      avatar_url: "",
    },
    mode: "onChange",
  })

  const username = form.watch("username")
  
  // Simple debounce implementation inside component for now or create a hook
  useEffect(() => {
    const checkUsername = async () => {
      if (username.length < 3) {
        setUsernameAvailable(null)
        return
      }
      
      setIsCheckingUsername(true)
      const supabase = createClient()
      const { data, error } = await supabase
        .from("profiles")
        .select("username")
        .eq("username", username)
        .single()
      
      setIsCheckingUsername(false)
      if (data) {
        setUsernameAvailable(false)
        form.setError("username", { message: "Username is taken" })
      } else {
        setUsernameAvailable(true)
        form.clearErrors("username")
      }
    }

    const timeoutId = setTimeout(() => {
      if (username) checkUsername()
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [username, form])

  async function onSubmit(values: z.infer<typeof profileSchema>) {
    setIsLoading(true)
    try {
      const supabase = createClient()
      
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        toast.error("No user found")
        setIsLoading(false)
        return
      }

      const { error } = await supabase
        .from("profiles")
        .upsert({
          id: user.id,
          username: values.username,
          display_name: values.display_name,
          bio: values.bio,
          avatar_url: values.avatar_url,
          updated_at: new Date().toISOString(),
        })

      if (error) {
        toast.error(error.message)
        setIsLoading(false)
        return
      }

      toast.success("Profile created!")
      router.push("/admin")
      router.refresh()
    } catch (error) {
      toast.error("Something went wrong. Please try again.")
      setIsLoading(false)
    }
  }

  const nextStep = () => {
    if (step === 1) {
      if (usernameAvailable) setStep(2)
    } else {
      setStep(step + 1)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-xl shadow-sm">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">
            {step === 1 ? "Choose your username" : "Tell us about yourself"}
          </h1>
          <p className="text-muted-foreground mt-2">
            {step === 1 ? "This will be your unique link." : "Add your profile details."}
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {step === 1 && (
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input placeholder="username" {...field} />
                        <div className="absolute right-3 top-2.5">
                          {isCheckingUsername ? (
                            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                          ) : usernameAvailable === true ? (
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          ) : usernameAvailable === false ? (
                            <XCircle className="h-4 w-4 text-red-500" />
                          ) : null}
                        </div>
                      </div>
                    </FormControl>
                    <FormDescription>
                      linktree.clone/{field.value || "username"}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {step === 2 && (
              <>
                <div className="flex flex-col items-center space-y-4 mb-6">
                  <FormLabel>Profile Picture</FormLabel>
                  <div className="flex items-center gap-4">
                    <Avatar className="h-24 w-24">
                      <AvatarImage src={avatarUrl || ""} />
                      <AvatarFallback>
                        {form.getValues("display_name")?.[0] || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <Input 
                      type="file" 
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0]
                        if (!file) return
                        
                        // Upload logic
                        const supabase = createClient()
                        const { data: { user } } = await supabase.auth.getUser()
                        if (!user) return

                        const fileExt = file.name.split('.').pop()
                        const filePath = `${user.id}/avatar.${fileExt}`

                        const { error: uploadError } = await supabase.storage
                          .from('avatars')
                          .upload(filePath, file, { upsert: true })

                        if (uploadError) {
                          toast.error('Error uploading avatar')
                        } else {
                          const { data: { publicUrl } } = supabase.storage
                            .from('avatars')
                            .getPublicUrl(filePath)
                          
                          // Add a timestamp to bust cache
                          const publicUrlWithTimestamp = `${publicUrl}?t=${new Date().getTime()}`
                          
                          setAvatarUrl(publicUrlWithTimestamp)
                          form.setValue("avatar_url", publicUrlWithTimestamp)
                          toast.success('Avatar uploaded!')
                        }
                      }}
                    />
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="display_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Display Name</FormLabel>
                      <FormControl>
                        <Input placeholder="My Name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bio</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Tell us about yourself" 
                          className="resize-none" 
                          {...field} 
                        />
                      </FormControl>
                      <div className="text-xs text-right text-muted-foreground">
                        {field.value?.length || 0}/80
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            <div className="flex justify-end space-x-4">
              {step === 1 ? (
                <Button 
                  type="button" 
                  onClick={nextStep}
                  disabled={!usernameAvailable || isCheckingUsername || !username}
                  className="w-full"
                >
                  Next
                </Button>
              ) : (
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Complete Setup
                </Button>
              )}
            </div>
          </form>
        </Form>
      </div>
    </div>
  )
}
