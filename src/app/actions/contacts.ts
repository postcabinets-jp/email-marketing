'use server'

import { revalidatePath } from 'next/cache'
import { requireAuth, type ActionResult } from './helpers'

// ── Create ──

export async function createContact(formData: FormData): Promise<ActionResult<{ id: string }>> {
  const { supabase, orgId } = await requireAuth()

  const email = formData.get('email') as string
  if (!email) return { success: false, error: 'メールアドレスは必須です' }

  const { data, error } = await supabase
    .from('contacts')
    .insert({
      organization_id: orgId,
      email,
      first_name: (formData.get('first_name') as string) || null,
      last_name: (formData.get('last_name') as string) || null,
      phone: (formData.get('phone') as string) || null,
      source: 'manual',
    })
    .select('id')
    .single()

  if (error) {
    if (error.code === '23505') return { success: false, error: 'このメールアドレスは既に登録されています' }
    return { success: false, error: error.message }
  }

  revalidatePath('/contacts')
  return { success: true, data: { id: data.id } }
}

// ── Update ──

export async function updateContact(
  id: string,
  fields: {
    email?: string
    first_name?: string | null
    last_name?: string | null
    phone?: string | null
    status?: 'subscribed' | 'unsubscribed' | 'bounced' | 'complained' | 'pending'
    custom_fields?: Record<string, unknown>
  }
): Promise<ActionResult> {
  const { supabase } = await requireAuth()

  const { error } = await supabase.from('contacts').update(fields).eq('id', id)
  if (error) return { success: false, error: error.message }

  revalidatePath('/contacts')
  revalidatePath(`/contacts/${id}`)
  return { success: true, data: null }
}

// ── Delete ──

export async function deleteContact(id: string): Promise<ActionResult> {
  const { supabase } = await requireAuth()

  const { error } = await supabase.from('contacts').delete().eq('id', id)
  if (error) return { success: false, error: error.message }

  revalidatePath('/contacts')
  return { success: true, data: null }
}

// ── Bulk Delete ──

export async function deleteContacts(ids: string[]): Promise<ActionResult> {
  const { supabase } = await requireAuth()

  const { error } = await supabase.from('contacts').delete().in('id', ids)
  if (error) return { success: false, error: error.message }

  revalidatePath('/contacts')
  return { success: true, data: null }
}

// ── Import (CSV rows as JSON array) ──

export async function importContacts(
  rows: Array<{ email: string; first_name?: string; last_name?: string; phone?: string }>
): Promise<ActionResult<{ imported: number; skipped: number }>> {
  const { supabase, orgId } = await requireAuth()

  if (!rows.length) return { success: false, error: 'インポートするデータがありません' }

  const records = rows.map((r) => ({
    organization_id: orgId,
    email: r.email,
    first_name: r.first_name || null,
    last_name: r.last_name || null,
    phone: r.phone || null,
    source: 'csv_import',
  }))

  // upsert to skip duplicates
  const { data, error } = await supabase
    .from('contacts')
    .upsert(records, { onConflict: 'organization_id,email', ignoreDuplicates: true })
    .select('id')

  if (error) return { success: false, error: error.message }

  const imported = data?.length ?? 0
  const skipped = rows.length - imported

  revalidatePath('/contacts')
  return { success: true, data: { imported, skipped } }
}

// ── Tag management ──

export async function addTagToContact(contactId: string, tagName: string, color?: string): Promise<ActionResult> {
  const { supabase, orgId } = await requireAuth()

  // upsert the tag
  const { data: tag, error: tagError } = await supabase
    .from('tags')
    .upsert({ organization_id: orgId, name: tagName, color: color || null }, { onConflict: 'organization_id,name' })
    .select('id')
    .single()

  if (tagError) return { success: false, error: tagError.message }

  const { error } = await supabase
    .from('contact_tags')
    .upsert({ contact_id: contactId, tag_id: tag.id }, { onConflict: 'contact_id,tag_id', ignoreDuplicates: true })

  if (error) return { success: false, error: error.message }

  revalidatePath(`/contacts/${contactId}`)
  return { success: true, data: null }
}

export async function removeTagFromContact(contactId: string, tagId: string): Promise<ActionResult> {
  const { supabase } = await requireAuth()

  const { error } = await supabase
    .from('contact_tags')
    .delete()
    .eq('contact_id', contactId)
    .eq('tag_id', tagId)

  if (error) return { success: false, error: error.message }

  revalidatePath(`/contacts/${contactId}`)
  return { success: true, data: null }
}
