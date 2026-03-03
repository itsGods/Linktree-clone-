import { create } from 'zustand'
import { Link } from '@/types/links'
import { updateLink, reorderLinks, toggleActive } from '@/server/actions/links'
import { toast } from 'sonner'

interface LinkEditorState {
  links: Link[]
  isLoading: boolean
  setLinks: (links: Link[]) => void
  addLink: (link: Link) => void
  updateLink: (id: string, data: Partial<Link>) => Promise<void>
  reorderLinks: (newLinks: Link[]) => Promise<void>
  toggleActive: (id: string, isActive: boolean) => Promise<void>
  deleteLink: (id: string) => void
}

export const useLinkEditorStore = create<LinkEditorState>((set, get) => ({
  links: [],
  isLoading: false,
  setLinks: (links) => set({ links }),
  addLink: (link) => set((state) => ({ links: [link, ...state.links] })),
  updateLink: async (id, data) => {
    // Optimistic update
    set((state) => ({
      links: state.links.map((link) => 
        link.id === id ? { ...link, ...data } : link
      )
    }))

    try {
      await updateLink(id, data)
    } catch (error) {
      // Revert or show error
      toast.error("Failed to update link")
      // In a real app we might want to revert here, but for now we'll just toast
    }
  },
  reorderLinks: async (newLinks) => {
    // Optimistic update
    set({ links: newLinks })

    try {
      const updates = newLinks.map((item, index) => ({
        id: item.id,
        position: index,
      }))
      await reorderLinks(updates)
    } catch (error) {
      toast.error("Failed to reorder links")
    }
  },
  toggleActive: async (id, isActive) => {
    // Optimistic update
    set((state) => ({
      links: state.links.map((link) => 
        link.id === id ? { ...link, is_active: isActive } : link
      )
    }))

    try {
      await toggleActive(id, isActive)
    } catch (error) {
      toast.error("Failed to toggle link")
      // Revert
      set((state) => ({
        links: state.links.map((link) => 
          link.id === id ? { ...link, is_active: !isActive } : link
        )
      }))
    }
  },
  deleteLink: (id) => {
    set((state) => ({
      links: state.links.filter((link) => link.id !== id)
    }))
  }
}))
