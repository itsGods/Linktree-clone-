import { ImageResponse } from 'next/og'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'edge'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const username = searchParams.get('username')
    const style = searchParams.get('style') || 'default'

    if (!username) {
      return new ImageResponse(
        (
          <div
            style={{
              fontSize: 40,
              color: 'black',
              background: 'white',
              width: '100%',
              height: '100%',
              padding: '50px 200px',
              textAlign: 'center',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            User not found
          </div>
        ),
        {
          width: 1200,
          height: 630,
        },
      )
    }

    // Initialize Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    const supabase = createClient(supabaseUrl, supabaseKey)

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('username', username)
      .single()

    if (!profile) {
      return new Response('Profile not found', { status: 404 })
    }

    const displayName = profile.display_name || username
    const bio = profile.bio || ''
    const avatarUrl = profile.avatar_url

    // Template Styles
    const styles = {
      default: {
        background: 'linear-gradient(to bottom right, #ffffff, #f3f4f6)',
        color: '#111827',
      },
      minimal: {
        background: '#ffffff',
        color: '#000000',
      },
      dark: {
        background: '#111827',
        color: '#ffffff',
      },
      gradient: {
        background: 'linear-gradient(to bottom right, #8b5cf6, #ec4899)',
        color: '#ffffff',
      },
      glass: {
        background: 'linear-gradient(to bottom right, #e0e7ff, #c7d2fe)',
        color: '#1e1b4b',
      },
    }

    const currentStyle = styles[style as keyof typeof styles] || styles.default

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: currentStyle.background,
            color: currentStyle.color,
            fontFamily: '"Inter", sans-serif',
          }}
        >
          {avatarUrl && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={avatarUrl}
              alt={displayName}
              width="128"
              height="128"
              style={{
                borderRadius: 128,
                marginBottom: 24,
                objectFit: 'cover',
                border: '4px solid rgba(255,255,255,0.2)',
              }}
            />
          )}
          <div
            style={{
              fontSize: 64,
              fontWeight: 900,
              marginBottom: 16,
              textAlign: 'center',
              padding: '0 40px',
              lineHeight: 1.1,
            }}
          >
            {displayName}
          </div>
          {bio && (
            <div
              style={{
                fontSize: 32,
                opacity: 0.8,
                textAlign: 'center',
                padding: '0 60px',
                maxWidth: 900,
                lineHeight: 1.4,
              }}
            >
              {bio}
            </div>
          )}
          
          <div
            style={{
              position: 'absolute',
              bottom: 40,
              display: 'flex',
              alignItems: 'center',
              opacity: 0.6,
              fontSize: 24,
            }}
          >
            <span style={{ fontWeight: 600 }}>linktree.clone/</span>
            <span>{username}</span>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      },
    )
  } catch (e: any) {
    console.log(`${e.message}`)
    return new Response(`Failed to generate the image`, {
      status: 500,
    })
  }
}
