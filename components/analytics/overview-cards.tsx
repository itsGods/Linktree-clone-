"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowDownIcon, ArrowUpIcon, MousePointerClick, Users, Eye, Percent } from "lucide-react"

interface OverviewCardsProps {
  data: {
    totalViews: number
    totalClicks: number
    ctr: number
    uniqueVisitors: number
  }
}

export function OverviewCards({ data }: OverviewCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Views</CardTitle>
          <Eye className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.totalViews.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">
            {/* +20.1% from last month */}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
          <MousePointerClick className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.totalClicks.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">
            {/* +15% from last month */}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">CTR</CardTitle>
          <Percent className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.ctr.toFixed(2)}%</div>
          <p className="text-xs text-muted-foreground">
            {/* +2% from last month */}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Unique Visitors</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.uniqueVisitors.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">
            {/* +10% from last month */}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
