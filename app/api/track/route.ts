import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { headers } from "next/headers"
import crypto from "crypto"

// Initialize Supabase Admin Client for inserting events
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Simple in-memory rate limiter (for demo purposes - use Redis in prod)
const rateLimitMap = new Map<string, { count: number, lastReset: number }>()

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const windowMs = 60 * 1000 // 1 minute
  const limit = 100

  const record = rateLimitMap.get(ip)
  
  if (!record) {
    rateLimitMap.set(ip, { count: 1, lastReset: now })
    return false
  }

  if (now - record.lastReset > windowMs) {
    rateLimitMap.set(ip, { count: 1, lastReset: now })
    return false
  }

  if (record.count >= limit) {
    return true
  }

  record.count++
  return false
}

function getDeviceType(userAgent: string): 'mobile' | 'tablet' | 'desktop' {
  const ua = userAgent.toLowerCase()
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return 'tablet'
  }
  if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
    return 'mobile'
  }
  return 'desktop'
}

function getBrowser(userAgent: string): string {
  const ua = userAgent.toLowerCase()
  if (ua.includes('chrome')) return 'Chrome'
  if (ua.includes('firefox')) return 'Firefox'
  if (ua.includes('safari')) return 'Safari'
  if (ua.includes('edge')) return 'Edge'
  return 'Other'
}

function getOS(userAgent: string): string {
  const ua = userAgent.toLowerCase()
  if (ua.includes('windows')) return 'Windows'
  if (ua.includes('mac')) return 'MacOS'
  if (ua.includes('linux')) return 'Linux'
  if (ua.includes('android')) return 'Android'
  if (ua.includes('ios')) return 'iOS'
  return 'Other'
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { profile_id, link_id, event_type, referrer, utm_source, utm_medium, utm_campaign } = body

    if (!profile_id || !event_type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const headersList = await headers()
    const userAgent = headersList.get("user-agent") || ""
    const ip = headersList.get("x-forwarded-for") || "127.0.0.1"

    // 1. Rate Limit
    if (isRateLimited(ip)) {
      return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 })
    }

    // 2. Parse User Agent
    const device_type = getDeviceType(userAgent)
    const browser = getBrowser(userAgent)
    const os = getOS(userAgent)

    // 3. GeoIP Lookup (Mocked for now as we don't have an external API key)
    // In production, use maxmind or ip-api.com
    const country = "Unknown"
    const city = "Unknown"
    const region = "Unknown"

    // 4. Hash IP
    const ip_hash = crypto.createHash('sha256').update(ip + (process.env.IP_SALT || 'salt')).digest('hex')

    // 5. Insert into analytics_events
    const { error } = await supabaseAdmin
      .from('analytics_events')
      .insert({
        profile_id,
        link_id,
        event_type,
        referrer,
        country,
        city,
        region,
        device_type,
        browser,
        os,
        utm_source,
        utm_medium,
        utm_campaign,
        ip_hash
      })

    if (error) {
      console.error("Error inserting event:", error)
      return NextResponse.json({ error: "Failed to track event" }, { status: 500 })
    }

    // 6. Increment link click count if applicable
    if (event_type === 'link_click' && link_id) {
      await supabaseAdmin.rpc('increment_click_count', { link_id })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Track API Error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
