"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { CreateLinkInput, UpdateLinkInput, reorderLinksSchema } from "@/lib/validators/links"
import { Link } from "@/types/links"

export async function createLink(input: CreateLinkInput) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) throw new Error("Unauthorized")

  // Get current max position
  const { data: maxPosData } = await supabase
    .from('links')
    .select('position')
    .eq('profile_id', user.id)
    .order('position', { ascending: false })
    .limit(1)
    .single()

  const newPosition = (maxPosData?.position ?? -1) + 1

  const { data, error } = await supabase
    .from('links')
    .insert({
      profile_id: user.id,
      type: input.type,
      title: input.title || (input.type === 'header' ? 'Header' : 'New Link'),
      url: input.url || '',
      position: newPosition,
      metadata: {}, // Default metadata based on type could go here
    })
    .select()
    .single()

  if (error) throw new Error(error.message)

  revalidatePath('/admin/links')
  revalidatePath(`/${user.id}`) // Ideally we'd revalidate the username path but we might not have it handy here easily without another fetch. 
  // For now, admin revalidation is key.
  
  return data as Link
}

export async function updateLink(id: string, input: UpdateLinkInput) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) throw new Error("Unauthorized")

  const { data, error } = await supabase
    .from('links')
    .update(input)
    .eq('id', id)
    .eq('profile_id', user.id) // Security check
    .select()
    .single()

  if (error) throw new Error(error.message)

  revalidatePath('/admin/links')
  return data as Link
}

export async function deleteLink(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) throw new Error("Unauthorized")

  const { error } = await supabase
    .from('links')
    .delete()
    .eq('id', id)
    .eq('profile_id', user.id)

  if (error) throw new Error(error.message)

  revalidatePath('/admin/links')
}

export async function reorderLinks(items: { id: string; position: number }[]) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) throw new Error("Unauthorized")

  // Validate input
  const parsed = reorderLinksSchema.safeParse(items)
  if (!parsed.success) throw new Error("Invalid input")

  // Create a transaction-like update using upsert or multiple updates
  // Supabase doesn't support explicit transactions over HTTP easily without RPC, 
  // but we can fire multiple requests or use an RPC if strict atomicity is needed.
  // For now, we'll iterate.
  
  const updates = items.map(item => 
    supabase
      .from('links')
      .update({ position: item.position })
      .eq('id', item.id)
      .eq('profile_id', user.id)
  )

  await Promise.all(updates)

  revalidatePath('/admin/links')
}

export async function toggleActive(id: string, currentState: boolean) {
  return updateLink(id, { is_active: !currentState })
}

export async function duplicateLink(link: Link) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) throw new Error("Unauthorized")

  // Get max position
  const { data: maxPosData } = await supabase
    .from('links')
    .select('position')
    .eq('profile_id', user.id)
    .order('position', { ascending: false })
    .limit(1)
    .single()
    
  const newPosition = (maxPosData?.position ?? -1) + 1

  const { id: _, created_at: __, updated_at: ___, ...linkData } = link

  const { data, error } = await supabase
    .from('links')
    .insert({
      ...linkData,
      title: `${linkData.title} (Copy)`,
      position: newPosition,
      profile_id: user.id
    })
    .select()
    .single()

  if (error) throw new Error(error.message)

  revalidatePath('/admin/links')
  return data as Link
}
