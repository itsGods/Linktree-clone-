import { getProfile } from "@/server/actions/profile"
import { getLinksByProfileId } from "@/server/queries/links"
import { MobilePreviewFrame } from "@/components/MobilePreviewFrame"
import { PublicProfile } from "@/components/PublicProfile"
import { ShareExperience } from "@/components/ShareExperience"
import { redirect } from "next/navigation"

export default async function AdminPreviewPage() {
  const profile = await getProfile()

  if (!profile) {
    redirect("/login")
  }

  const links = await getLinksByProfileId(profile.id)

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-8 bg-gray-50 dark:bg-gray-900/50">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Live Preview</h1>
        <p className="text-muted-foreground">
          See exactly what your visitors will see.
        </p>
        <ShareExperience username={profile.username} />
      </div>

      <MobilePreviewFrame username={profile.username}>
        <PublicProfile profile={profile} links={links} isPreview={true} />
      </MobilePreviewFrame>
    </div>
  )
}
