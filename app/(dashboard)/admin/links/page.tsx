import { createClient } from "@/lib/supabase/server"
import { AddLinkModal } from "@/components/links/add-link-modal"
import { LinkEditor } from "@/components/links/link-editor"
import { getLinksByProfileId } from "@/server/queries/links"
import { MobilePreview } from "@/components/preview/mobile-preview"
import { SharePanel } from "@/components/dashboard/share-panel"
import { StoreInitializer } from "@/components/store-initializer"
import { MobilePreviewToggle } from "@/components/preview/mobile-preview-toggle"

export default async function LinksPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  // Fetch profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  const links = await getLinksByProfileId(user.id)

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] overflow-hidden bg-gray-50/50">
      <StoreInitializer links={links} />
      
      {/* Share Panel */}
      <div className="p-6 pb-0 max-w-7xl mx-auto w-full">
        <SharePanel username={profile?.username || user.email?.split('@')[0] || "user"} />
      </div>

      <div className="flex flex-col lg:flex-row flex-1 overflow-hidden p-6 gap-8 max-w-7xl mx-auto w-full">
        {/* Editor Column */}
        <div className="flex-1 flex flex-col space-y-6 overflow-y-auto pr-2 pb-20 scrollbar-hide">
          <h1 className="text-2xl font-bold text-gray-900">Links</h1>
          <AddLinkModal />
          <LinkEditor initialLinks={links} />
        </div>

        {/* Preview Column */}
        <div className="hidden lg:flex w-[450px] flex-col items-center justify-center sticky top-6 h-full">
          <div className="relative w-full h-full flex items-center justify-center">
             <MobilePreview user={profile || { username: "user" }} />
          </div>
        </div>
      </div>
      
      <MobilePreviewToggle user={profile || { username: "user" }} />
    </div>
  )
}
