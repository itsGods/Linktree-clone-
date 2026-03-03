import { z } from "zod"

export const linkSchema = z.object({
  title: z.string().min(1, "Title is required").optional(),
  url: z.string().url("Invalid URL").optional().or(z.literal("")),
  is_active: z.boolean().optional(),
  is_highlighted: z.boolean().optional(),
  highlight_animation: z.enum(['none', 'shake', 'pulse', 'bounce', 'glow']).optional(),
  schedule_start: z.string().nullable().optional(),
  schedule_end: z.string().nullable().optional(),
  thumbnail_url: z.string().nullable().optional(),
})

export const createLinkSchema = z.object({
  type: z.enum([
    'classic',
    'header',
    'text_block',
    'image',
    'video',
    'music',
    'commerce',
    'email_collector',
    'contact',
    'map'
  ]),
  title: z.string().optional(),
  url: z.string().optional(),
})

export const reorderLinksSchema = z.array(
  z.object({
    id: z.string(),
    position: z.number(),
  })
)

export type UpdateLinkInput = z.infer<typeof linkSchema>
export type CreateLinkInput = z.infer<typeof createLinkSchema>
