import { notFound } from "next/navigation"
import Link from "next/link"
import { Metadata, ResolvingMetadata } from "next"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getPublicLinksByUsername } from "@/server/queries/links"
import { getProfileByUsername } from "@/server/queries/profile"
import { LinkRenderer } from "@/components/links/renderers"
import { resolveTheme, generateThemeCSS } from "@/lib/theme/resolve-theme"
import { Theme } from "@/types/theme"
import { fontClassNames } from "@/lib/fonts"
import { PageViewTracker } from "@/components/analytics/page-view-tracker"

export const revalidate = 60 // Cache for 60 seconds

interface Props {
  params: Promise<{ username: string }>
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { username } = await params
  const profile = await getProfileByUsername(username)

  if (!profile) {
    return {
      title: "User not found",
    }
  }

  const title = profile.seo_title || profile.display_name || `@${profile.username}`
  const description = profile.seo_description || profile.bio || `Check out ${profile.display_name || profile.username}'s links`
  
  const ogImage = profile.og_image_url || `/api/og?username=${username}&style=${profile.og_template_style || 'default'}`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [ogImage],
      type: 'profile',
      username: profile.username,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
  }
}

export default async function UserProfilePage({
  params,
}: Props) {
  const { username } = await params
  
  // Parallel fetch
  const [profile, links] = await Promise.all([
    getProfileByUsername(username),
    getPublicLinksByUsername(username)
  ])

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
            <AvatarImage src={profile.avatar_url || undefined} alt={profile.username} />
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

        <div className="w-full space-y-4 flex flex-col items-center px-4">
          {links.map((link, index) => (
            <LinkRenderer key={link.id} link={link} index={index} />
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
