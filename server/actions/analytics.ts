"use server"

import { createClient } from "@/lib/supabase/server"
import { AnalyticsData } from "@/types/analytics"
import { format, subDays } from "date-fns"

export async function getAnalyticsData(
  from: Date = subDays(new Date(), 7),
  to: Date = new Date()
): Promise<AnalyticsData> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) throw new Error("Unauthorized")

  // Fetch user profile to check subscription tier
  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_tier')
    .eq('id', user.id)
    .single()

  const isPremium = profile?.subscription_tier === 'premium' || profile?.subscription_tier === 'pro'
  const isPro = profile?.subscription_tier === 'pro' || isPremium

  // Enforce date range limits for free users
  let effectiveFrom = from
  if (!isPro) {
    const maxHistory = subDays(new Date(), 28)
    if (from < maxHistory) {
      effectiveFrom = maxHistory
    }
  }

  // 1. Fetch Daily Summary (Aggregated)
  const { data: dailyData, error: dailyError } = await supabase
    .from('analytics_daily_summary')
    .select('*')
    .eq('profile_id', user.id)
    .gte('date', format(effectiveFrom, 'yyyy-MM-dd'))
    .lte('date', format(to, 'yyyy-MM-dd'))
    .order('date', { ascending: true })

  if (dailyError) throw new Error(dailyError.message)

  // 2. Fetch Top Links (Aggregated from raw events for now, or we could add link_id to summary)
  // For better performance, we should have a link_summary table.
  // For now, we'll query raw events but limit the scope.
  const { data: linkEvents } = await supabase
    .from('analytics_events')
    .select('link_id, event_type')
    .eq('profile_id', user.id)
    .eq('event_type', 'link_click')
    .gte('created_at', effectiveFrom.toISOString())
    .lte('created_at', to.toISOString())

  // 3. Fetch Traffic Sources (Aggregated from raw events)
  const { data: referrerEvents } = await supabase
    .from('analytics_events')
    .select('referrer')
    .eq('profile_id', user.id)
    .gte('created_at', effectiveFrom.toISOString())
    .lte('created_at', to.toISOString())

  // 4. Fetch Device Data
  const { data: deviceEvents } = await supabase
    .from('analytics_events')
    .select('device_type')
    .eq('profile_id', user.id)
    .gte('created_at', effectiveFrom.toISOString())
    .lte('created_at', to.toISOString())

  // --- Process Data ---

  // Overview
  const totalViews = dailyData?.reduce((acc, curr) => acc + curr.views, 0) || 0
  const totalClicks = dailyData?.reduce((acc, curr) => acc + curr.clicks, 0) || 0
  const uniqueVisitors = dailyData?.reduce((acc, curr) => acc + curr.unique_visitors, 0) || 0
  const ctr = totalViews > 0 ? (totalClicks / totalViews) * 100 : 0

  // Chart Data
  const chartData = dailyData?.map(d => ({
    date: format(new Date(d.date), 'MMM dd'),
    views: d.views,
    clicks: d.clicks
  })) || []

  // Top Links Processing
  const linkCounts: Record<string, number> = {}
  linkEvents?.forEach(e => {
    if (e.link_id) linkCounts[e.link_id] = (linkCounts[e.link_id] || 0) + 1
  })

  // We need link titles. Fetch them.
  const linkIds = Object.keys(linkCounts)
  let topLinks: any[] = []
  
  if (linkIds.length > 0) {
    const { data: links } = await supabase
      .from('links')
      .select('id, title')
      .in('id', linkIds)
    
    topLinks = links?.map(l => ({
      id: l.id,
      title: l.title,
      clicks: linkCounts[l.id],
      ctr: 0 // We'd need view counts per link to calculate true CTR
    })).sort((a, b) => b.clicks - a.clicks).slice(0, 5) || []
  }

  // Traffic Sources Processing
  const referrerCounts: Record<string, number> = {}
  referrerEvents?.forEach(e => {
    const ref = e.referrer ? new URL(e.referrer).hostname : 'Direct'
    referrerCounts[ref] = (referrerCounts[ref] || 0) + 1
  })
  
  const totalReferrers = referrerEvents?.length || 1
  const trafficSources = Object.entries(referrerCounts)
    .map(([source, count]) => ({
      source,
      count,
      percentage: (count / totalReferrers) * 100
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  // Device Processing
  const deviceCounts: Record<string, number> = {}
  deviceEvents?.forEach(e => {
    const dev = e.device_type || 'desktop'
    deviceCounts[dev] = (deviceCounts[dev] || 0) + 1
  })

  const totalDevices = deviceEvents?.length || 1
  const deviceData = Object.entries(deviceCounts)
    .map(([device, count]) => ({
      device,
      count,
      percentage: (count / totalDevices) * 100
    }))

  // Geo Data (Pro Feature)
  let geoData: any[] = []
  if (isPro) {
    const { data: geoEvents } = await supabase
      .from('analytics_events')
      .select('country')
      .eq('profile_id', user.id)
      .gte('created_at', effectiveFrom.toISOString())
      .lte('created_at', to.toISOString())

    const geoCounts: Record<string, number> = {}
    geoEvents?.forEach(e => {
      const country = e.country || 'Unknown'
      geoCounts[country] = (geoCounts[country] || 0) + 1
    })

    const totalGeo = geoEvents?.length || 1
    geoData = Object.entries(geoCounts)
      .map(([country, count]) => ({
        country,
        count,
        percentage: (count / totalGeo) * 100
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
  }

  return {
    overview: {
      totalViews,
      totalClicks,
      ctr,
      uniqueVisitors
    },
    chartData,
    topLinks,
    trafficSources,
    geoData,
    deviceData
  }
}
