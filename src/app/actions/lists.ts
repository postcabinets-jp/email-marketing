'use server'

import { revalidatePath } from 'next/cache'
import { requireAuth, type ActionResult } from './helpers'

// ── Create ──

export async function createList(formData: FormData): Promise<ActionResult<{ id: string }>> {
  const { supabase, orgId } = await requireAuth()

  const name = formData.get('name') as string
  if (!name) return { success: false, error: 'リスト名は必須です' }

  const { data, error } = await supabase
    .from('lists')
    .insert({
      organization_id: orgId,
      name,
      description: (formData.get('description') as string) || null,
      from_name: (formData.get('from_name') as string) || null,
      from_email: (formData.get('from_email') as string) || null,
      double_optin: formData.get('double_optin') === 'true',
    })
    .select('id')
    .single()

  if (error) return { success: false, error: error.message }

  revalidatePath('/lists')
  return { success: true, data: { id: data.id } }
}

// ── Update ──

export async function updateList(
  id: string,
  fields: {
    name?: string
    description?: string | null
    from_name?: string | null
    from_email?: string | null
    reply_to?: string | null
    double_optin?: boolean
  }
): Promise<ActionResult> {
  const { supabase } = await requireAuth()

  const { error } = await supabase.from('lists').update(fields).eq('id', id)
  if (error) return { success: false, error: error.message }

  revalidatePath('/lists')
  revalidatePath(`/lists/${id}`)
  return { success: true, data: null }
}

// ── Delete ──

export async function deleteList(id: string): Promise<ActionResult> {
  const { supabase } = await requireAuth()

  const { error } = await supabase.from('lists').delete().eq('id', id)
  if (error) return { success: false, error: error.message }

  revalidatePath('/lists')
  return { success: true, data: null }
}

// ── Add contacts to list ──

export async function addContactsToList(
  listId: string,
  contactIds: string[]
): Promise<ActionResult<{ added: number }>> {
  const { supabase } = await requireAuth()

  const records = contactIds.map((contactId) => ({
    list_id: listId,
    contact_id: contactId,
    status: 'subscribed' as const,
  }))

  const { data, error } = await supabase
    .from('list_contacts')
    .upsert(records, { onConflict: 'list_id,contact_id', ignoreDuplicates: true })
    .select('list_id')

  if (error) return { success: false, error: error.message }

  // Update subscriber_count
  const { count } = await supabase
    .from('list_contacts')
    .select('*', { count: 'exact', head: true })
    .eq('list_id', listId)
    .eq('status', 'subscribed')

  await supabase
    .from('lists')
    .update({ subscriber_count: count ?? 0 })
    .eq('id', listId)

  revalidatePath(`/lists/${listId}`)
  return { success: true, data: { added: data?.length ?? 0 } }
}

// ── Remove contact from list ──

export async function removeContactFromList(listId: string, contactId: string): Promise<ActionResult> {
  const { supabase } = await requireAuth()

  const { error } = await supabase
    .from('list_contacts')
    .delete()
    .eq('list_id', listId)
    .eq('contact_id', contactId)

  if (error) return { success: false, error: error.message }

  // Update subscriber_count
  const { count } = await supabase
    .from('list_contacts')
    .select('*', { count: 'exact', head: true })
    .eq('list_id', listId)
    .eq('status', 'subscribed')

  await supabase
    .from('lists')
    .update({ subscriber_count: count ?? 0 })
    .eq('id', listId)

  revalidatePath(`/lists/${listId}`)
  return { success: true, data: null }
}
