"use client"

import { useState, useEffect } from "react"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { toast } from "sonner"

import { Link } from "@/types/links"
import { LinkCard } from "./link-card"
import { reorderLinks } from "@/server/actions/links"

interface LinkEditorProps {
  initialLinks: Link[]
}

export function LinkEditor({ initialLinks }: LinkEditorProps) {
  const [links, setLinks] = useState(initialLinks)

  // Sync with server state if initialLinks changes (e.g. after add/delete)
  useEffect(() => {
    setLinks(initialLinks)
  }, [initialLinks])

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (active.id !== over?.id) {
      setLinks((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id)
        const newIndex = items.findIndex((item) => item.id === over?.id)
        
        const newItems = arrayMove(items, oldIndex, newIndex)
        
        // Optimistic update
        const updates = newItems.map((item, index) => ({
          id: item.id,
          position: index,
        }))
        
        // Fire and forget (or handle error)
        reorderLinks(updates).catch(() => {
          toast.error("Failed to reorder links")
          setLinks(items) // Revert on error
        })

        return newItems
      })
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={links.map(l => l.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-4">
          {links.map((link) => (
            <LinkCard key={link.id} link={link} />
          ))}
          {links.length === 0 && (
            <div className="text-center py-12 text-gray-500 border-2 border-dashed rounded-xl">
              <p>No links yet. Add one to get started!</p>
            </div>
          )}
        </div>
      </SortableContext>
    </DndContext>
  )
}
