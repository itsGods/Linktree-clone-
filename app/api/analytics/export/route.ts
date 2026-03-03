import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { format } from "date-fns"

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams
  const from = searchParams.get('from')
  const to = searchParams.get('to')

  if (!from || !to) {
    return NextResponse.json({ error: "Missing date range" }, { status: 400 })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Fetch daily summary for export
  const { data: dailyData, error } = await supabase
    .from('analytics_daily_summary')
    .select('*')
    .eq('profile_id', user.id)
    .gte('date', format(new Date(from), 'yyyy-MM-dd'))
    .lte('date', format(new Date(to), 'yyyy-MM-dd'))
    .order('date', { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Generate CSV
  const headers = ['Date', 'Views', 'Clicks', 'Unique Visitors']
  const rows = dailyData.map(row => [
    row.date,
    row.views,
    row.clicks,
    row.unique_visitors
  ])

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n')

  return new NextResponse(csvContent, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="analytics-export.csv"`
    }
  })
}
