"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface TopLinksProps {
  data: {
    id: string
    title: string
    clicks: number
    ctr: number
  }[]
}

export function TopLinks({ data }: TopLinksProps) {
  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>Top Performing Links</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Link Title</TableHead>
              <TableHead className="text-right">Clicks</TableHead>
              <TableHead className="text-right">CTR</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((link) => (
              <TableRow key={link.id}>
                <TableCell className="font-medium">{link.title}</TableCell>
                <TableCell className="text-right">{link.clicks}</TableCell>
                <TableCell className="text-right">{link.ctr.toFixed(1)}%</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
