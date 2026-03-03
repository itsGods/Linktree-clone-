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
  bio: z.string().max(80, { message: "Bio must be at most 80 characters" }).optional(),
  avatar_url: z.string().optional(),
})

export type ProfileInput = z.infer<typeof profileSchema>
