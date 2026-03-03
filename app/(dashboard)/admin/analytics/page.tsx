"use client"

import { useState, useEffect } from "react"
import { DateRange } from "react-day-picker"
import { subDays } from "date-fns"
import { DateRangePicker } from "@/components/analytics/date-range-picker"
import { OverviewCards } from "@/components/analytics/overview-cards"
import { AnalyticsChart } from "@/components/analytics/analytics-chart"
import { TopLinks } from "@/components/analytics/top-links"
import { TrafficSources } from "@/components/analytics/traffic-sources"
import { DeviceBreakdown } from "@/components/analytics/device-breakdown"
import { GeoBreakdown } from "@/components/analytics/geo-breakdown"
import { Button } from "@/components/ui/button"
import { Download, Loader2 } from "lucide-react"
import { getAnalyticsData } from "@/server/actions/analytics"
import { AnalyticsData } from "@/types/analytics"
import { toast } from "sonner"

export default function AnalyticsPage() {
  const [date, setDate] = useState<DateRange | undefined>({
    from: subDays(new Date(), 7),
    to: new Date(),
  })
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      if (!date?.from || !date?.to) return
      
      setLoading(true)
      try {
        const result = await getAnalyticsData(date.from, date.to)
        setData(result)
      } catch (error) {
        toast.error("Failed to load analytics")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [date])

  const handleExport = async () => {
    if (!date?.from || !date?.to) return
    
    try {
      const response = await fetch(`/api/analytics/export?from=${date.from.toISOString()}&to=${date.to.toISOString()}`)
      if (!response.ok) throw new Error("Export failed")
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `analytics-${date.from.toISOString().split('T')[0]}-${date.to.toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      toast.success("Export downloaded")
    } catch (error) {
      toast.error("Failed to export CSV")
    }
  }

  return (
    <div className="flex flex-col h-full p-8 space-y-8 overflow-y-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <div className="flex items-center gap-4">
          <DateRangePicker date={date} setDate={setDate} />
          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      ) : data ? (
        <div className="space-y-8 pb-8">
          <OverviewCards data={data.overview} />
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <AnalyticsChart data={data.chartData} />
            <TrafficSources data={data.trafficSources} />
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <TopLinks data={data.topLinks} />
            <DeviceBreakdown data={data.deviceData} />
          </div>

          {data.geoData && data.geoData.length > 0 && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <GeoBreakdown data={data.geoData} />
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          No data available for this period.
        </div>
      )}
    </div>
  )
}
