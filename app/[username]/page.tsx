import { notFound } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getPublicLinksByUsername } from "@/server/queries/links"
import { LinkRenderer } from "@/components/links/renderers"
import { resolveTheme, generateThemeCSS } from "@/lib/theme/resolve-theme"
import { Theme } from "@/types/theme"
import { fontClassNames } from "@/lib/fonts"
import { PageViewTracker } from "@/components/analytics/page-view-tracker"

export const revalidate = 60 // Cache for 60 seconds

export default async function UserProfilePage({
  params,
}: {
  params: Promise<{ username: string }>
}) {
  const { username } = await params
  const supabase = await createClient()
  
  // Parallel fetch
  const [profileResponse, links] = await Promise.all([
    supabase
      .from("profiles")
      .select("*, themes(*)")
      .eq("username", username)
      .single(),
    getPublicLinksByUsername(username)
  ])

  const profile = profileResponse.data

  if (!profile) {
    notFound()
  }

  // Resolve Theme
  const theme = resolveTheme(
    profile.themes as unknown as Theme | null,
    profile.custom_appearance as Partial<Theme> | null
  )
  const themeCSS = generateThemeCSS(theme)

  return (
    <div 
      className={`min-h-screen flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8 ${fontClassNames}`}
      style={{
        ...themeCSS,
        background: 'var(--bg)',
        fontFamily: 'var(--font-family)',
        color: 'var(--font-color)'
      } as React.CSSProperties}
    >
      <PageViewTracker profileId={profile.id} />
      
      <div className="w-full max-w-md space-y-8 flex flex-col items-center z-10">
        <div className="flex flex-col items-center space-y-4 text-center w-full">
          <Avatar 
            className={`h-24 w-24 border-2 border-white shadow-md ${theme.avatar_shape === 'square' ? 'rounded-none' : theme.avatar_shape === 'rounded' ? 'rounded-xl' : 'rounded-full'}`}
          >
            <AvatarImage src={profile.avatar_url} alt={profile.username} />
            <AvatarFallback>{profile.username[0].toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--title-color)' }}>
              {profile.display_name || `@${profile.username}`}
            </h1>
            {profile.bio && (
              <p className="mt-2 text-sm max-w-xs mx-auto" style={{ color: 'var(--bio-color)' }}>{profile.bio}</p>
            )}
          </div>
        </div>

        <div className="w-full space-y-4 flex flex-col items-center">
          {links.map((link) => (
            <LinkRenderer key={link.id} link={link} />
          ))}
          
          {links.length === 0 && (
            <div className="text-center py-8 opacity-50">
              <p>No links yet</p>
            </div>
          )}
        </div>
        
        {!theme.hide_branding && (
          <div className="mt-12">
            <Link href="/" className="text-xs hover:underline font-medium opacity-50 hover:opacity-100 transition-opacity">
              Linktree Clone
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
