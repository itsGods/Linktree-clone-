"use client"

import { useState } from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { toast } from "sonner"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Link } from "@/types/links"
import { updateLink } from "@/server/actions/links"

interface ScheduleModalProps {
  link: Link
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ScheduleModal({ link, open, onOpenChange }: ScheduleModalProps) {
  const [startDate, setStartDate] = useState(link.schedule_start ? format(new Date(link.schedule_start), "yyyy-MM-dd'T'HH:mm") : "")
  const [endDate, setEndDate] = useState(link.schedule_end ? format(new Date(link.schedule_end), "yyyy-MM-dd'T'HH:mm") : "")

  const handleSave = async () => {
    try {
      if (startDate && endDate && new Date(endDate) <= new Date(startDate)) {
        toast.error("End date must be after start date")
        return
      }

      await updateLink(link.id, {
        schedule_start: startDate ? new Date(startDate).toISOString() : null,
        schedule_end: endDate ? new Date(endDate).toISOString() : null,
      })
      
      toast.success("Schedule updated")
      onOpenChange(false)
    } catch (error) {
      toast.error("Failed to update schedule")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Schedule Link</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="start">Start Date</Label>
            <Input
              id="start"
              type="datetime-local"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="end">End Date</Label>
            <Input
              id="end"
              type="datetime-local"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave}>Save Schedule</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
