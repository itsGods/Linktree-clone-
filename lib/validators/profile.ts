import { z } from "zod"

export const profileSchema = z.object({
  username: z
    .string()
    .min(3, { message: "Username must be at least 3 characters" })
    .max(20, { message: "Username must be at most 20 characters" })
    .regex(/^[a-z0-9_]+$/, {
      message: "Username can only contain lowercase letters, numbers, and underscores",
    }),
  display_name: z.string().min(1, { message: "Display name is required" }).optional(),
  bio: z.string().max(160, { message: "Bio must be at most 160 characters" }).optional(),
  avatar_url: z.string().optional(),
  seo_title: z.string().max(60, { message: "SEO Title must be at most 60 characters" }).optional(),
  seo_description: z.string().max(160, { message: "SEO Description must be at most 160 characters" }).optional(),
  og_image_url: z.string().optional(),
  og_template_style: z.enum(['default', 'minimal', 'dark', 'gradient', 'glass']).optional(),
})

export type ProfileInput = z.infer<typeof profileSchema>
