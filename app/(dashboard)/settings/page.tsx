import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { ProfileSettings } from "@/components/settings/ProfileSettings"
import { AccountSettings } from "@/components/settings/AccountSettings"
import { SeoSettings } from "@/components/settings/SeoSettings"
import { DomainSettings } from "@/components/settings/DomainSettings"
import { DangerZone } from "@/components/settings/DangerZone"
import { Profile } from "@/types/profile"

export const metadata = {
  title: "Settings | Linktree Clone",
  description: "Manage your profile and account settings.",
}

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) {
    redirect("/onboarding")
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your account settings and preferences.
        </p>
      </div>

      <div className="space-y-8">
        <ProfileSettings profile={profile as Profile} />
        <AccountSettings profile={profile as Profile} email={user.email || ""} />
        <SeoSettings profile={profile as Profile} />
        <DomainSettings />
        <DangerZone />
      </div>
    </div>
  )
}
