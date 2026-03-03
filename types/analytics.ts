export type EventType = 'page_view' | 'link_click' | 'social_click' | 'cta_click'
export type DeviceType = 'mobile' | 'tablet' | 'desktop'

export interface AnalyticsEvent {
  id: string
  profile_id: string
  link_id?: string
  event_type: EventType
  referrer?: string
  country?: string
  city?: string
  region?: string
  device_type?: DeviceType
  browser?: string
  os?: string
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  ip_hash?: string
  created_at: string
}

export interface DailySummary {
  id: string
  profile_id: string
  date: string
  views: number
  clicks: number
  unique_visitors: number
  created_at: string
}

export interface AnalyticsData {
  overview: {
    totalViews: number
    totalClicks: number
    ctr: number
    uniqueVisitors: number
  }
  chartData: {
    date: string
    views: number
    clicks: number
  }[]
  topLinks: {
    id: string
    title: string
    clicks: number
    ctr: number
  }[]
  trafficSources: {
    source: string
    count: number
    percentage: number
  }[]
  geoData: {
    country: string
    count: number
    percentage: number
  }[]
  deviceData: {
    device: string
    count: number
    percentage: number
  }[]
}
