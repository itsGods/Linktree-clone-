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
  DragStartEvent,
  DragOverlay,
  defaultDropAnimationSideEffects,
  DropAnimation,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { toast } from "sonner"
import { createPortal } from "react-dom"

import { Link } from "@/types/links"
import { LinkCard } from "./link-card"
import { useLinkEditorStore } from "@/store/linkEditorStore"

interface LinkEditorProps {
  initialLinks: Link[]
}

const dropAnimation: DropAnimation = {
  sideEffects: defaultDropAnimationSideEffects({
    styles: {
      active: {
        opacity: '0.5',
      },
    },
  }),
}

export function LinkEditor({ initialLinks }: LinkEditorProps) {
  const { links, setLinks, reorderLinks } = useLinkEditorStore()
  const [activeId, setActiveId] = useState<string | null>(null)

  // Sync with server state if initialLinks changes (e.g. after add/delete)
  useEffect(() => {
    setLinks(initialLinks)
  }, [initialLinks, setLinks])

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // Prevent accidental drags
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)

    if (active.id !== over?.id) {
      const oldIndex = links.findIndex((item) => item.id === active.id)
      const newIndex = links.findIndex((item) => item.id === over?.id)
      
      const newItems = arrayMove(links, oldIndex, newIndex)
      
      await reorderLinks(newItems)
    }
  }

  const activeLink = links.find(link => link.id === activeId)

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={links.map(l => l.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-3 pb-20">
          {links.map((link) => (
            <LinkCard key={link.id} link={link} />
          ))}
          {links.length === 0 && (
            <div className="text-center py-12 text-gray-500 border-2 border-dashed rounded-xl bg-gray-50/50">
              <p>No links yet. Add one to get started!</p>
            </div>
          )}
        </div>
      </SortableContext>

      {/* Drag Overlay for smooth dragging visual */}
      {createPortal(
        <DragOverlay dropAnimation={dropAnimation}>
          {activeLink ? (
            <div className="opacity-90 rotate-2 scale-105 cursor-grabbing">
               <LinkCard link={activeLink} />
            </div>
          ) : null}
        </DragOverlay>,
        document.body
      )}
    </DndContext>
  )
}
