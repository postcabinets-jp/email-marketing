'use server'

import { revalidatePath } from 'next/cache'
import { requireAuth, type ActionResult } from './helpers'

// ── Create ──

export async function createTemplate(formData: FormData): Promise<ActionResult<{ id: string }>> {
  const { supabase, orgId } = await requireAuth()

  const { data, error } = await supabase
    .from('email_templates')
    .insert({
      organization_id: orgId,
      name: (formData.get('name') as string) || '無題のテンプレート',
      subject: (formData.get('subject') as string) || null,
      html_body: (formData.get('html_body') as string) || '',
      text_body: (formData.get('text_body') as string) || null,
      preview_text: (formData.get('preview_text') as string) || null,
    })
    .select('id')
    .single()

  if (error) return { success: false, error: error.message }

  revalidatePath('/templates')
  return { success: true, data: { id: data.id } }
}

// ── Update ──

export async function updateTemplate(
  id: string,
  fields: {
    name?: string
    subject?: string | null
    html_body?: string
    text_body?: string | null
    preview_text?: string | null
  }
): Promise<ActionResult> {
  const { supabase } = await requireAuth()

  const { error } = await supabase.from('email_templates').update(fields).eq('id', id)
  if (error) return { success: false, error: error.message }

  revalidatePath('/templates')
  return { success: true, data: null }
}

// ── Delete ──

export async function deleteTemplate(id: string): Promise<ActionResult> {
  const { supabase } = await requireAuth()

  const { error } = await supabase.from('email_templates').delete().eq('id', id)
  if (error) return { success: false, error: error.message }

  revalidatePath('/templates')
  return { success: true, data: null }
}

// ── Duplicate ──

export async function duplicateTemplate(id: string): Promise<ActionResult<{ id: string }>> {
  const { supabase, orgId } = await requireAuth()

  const { data: original } = await supabase
    .from('email_templates')
    .select('name,subject,html_body,text_body,preview_text')
    .eq('id', id)
    .single()

  if (!original) return { success: false, error: 'テンプレートが見つかりません' }

  const { data, error } = await supabase
    .from('email_templates')
    .insert({
      organization_id: orgId,
      name: `${original.name} (コピー)`,
      subject: original.subject,
      html_body: original.html_body,
      text_body: original.text_body,
      preview_text: original.preview_text,
    })
    .select('id')
    .single()

  if (error) return { success: false, error: error.message }

  revalidatePath('/templates')
  return { success: true, data: { id: data.id } }
}
