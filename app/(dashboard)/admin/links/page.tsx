import { createClient } from "@/lib/supabase/server"
import { AddLinkModal } from "@/components/links/add-link-modal"
import { LinkEditor } from "@/components/links/link-editor"
import { getLinksByProfileId } from "@/server/queries/links"

export default async function LinksPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  const links = await getLinksByProfileId(user.id)

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-4rem)] gap-8">
      {/* Editor Column */}
      <div className="flex-1 flex flex-col gap-6 overflow-y-auto pr-2">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Links</h1>
        </div>
        
        <AddLinkModal />
        
        <LinkEditor initialLinks={links} />
      </div>

      {/* Preview Column */}
      <div className="hidden lg:flex w-[400px] flex-col items-center justify-center bg-gray-100 rounded-3xl border-8 border-gray-900 shadow-2xl overflow-hidden relative">
        <div className="absolute top-0 w-40 h-6 bg-gray-900 rounded-b-xl z-10"></div>
        <div className="w-full h-full bg-white overflow-y-auto no-scrollbar">
          <iframe 
            src={`/${user.id}`} // We'll need to map this to username or use a preview route
            className="w-full h-full border-none"
            title="Preview"
          />
        </div>
      </div>
    </div>
  )
}
