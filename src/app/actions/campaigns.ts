'use server'

import { revalidatePath } from 'next/cache'
import { requireAuth, type ActionResult } from './helpers'

// ── Create ──

export async function createCampaign(formData: FormData): Promise<ActionResult<{ id: string }>> {
  const { supabase, orgId } = await requireAuth()

  const name = formData.get('name') as string
  const subject = formData.get('subject') as string

  const { data, error } = await supabase
    .from('campaigns')
    .insert({
      organization_id: orgId,
      name: name || '無題のキャンペーン',
      subject: subject || '(件名未設定)',
      preview_text: (formData.get('preview_text') as string) || null,
      from_name: (formData.get('from_name') as string) || '',
      from_email: (formData.get('from_email') as string) || '',
      reply_to: (formData.get('reply_to') as string) || null,
      html_body: (formData.get('html_body') as string) || '',
      text_body: (formData.get('text_body') as string) || null,
      list_id: (formData.get('list_id') as string) || null,
      segment_id: (formData.get('segment_id') as string) || null,
      status: 'draft',
    })
    .select('id')
    .single()

  if (error) return { success: false, error: error.message }

  revalidatePath('/campaigns')
  return { success: true, data: { id: data.id } }
}

// ── Update ──

export async function updateCampaign(
  id: string,
  fields: {
    name?: string
    subject?: string
    preview_text?: string | null
    from_name?: string
    from_email?: string
    reply_to?: string | null
    html_body?: string
    text_body?: string | null
    list_id?: string | null
    segment_id?: string | null
  }
): Promise<ActionResult> {
  const { supabase } = await requireAuth()

  // Only allow updates to draft campaigns
  const { data: campaign } = await supabase
    .from('campaigns')
    .select('status')
    .eq('id', id)
    .single()

  if (!campaign) return { success: false, error: 'キャンペーンが見つかりません' }
  if (campaign.status !== 'draft') {
    return { success: false, error: '下書き以外のキャンペーンは編集できません' }
  }

  const { error } = await supabase.from('campaigns').update(fields).eq('id', id)
  if (error) return { success: false, error: error.message }

  revalidatePath('/campaigns')
  revalidatePath(`/campaigns/${id}`)
  return { success: true, data: null }
}

// ── Delete ──

export async function deleteCampaign(id: string): Promise<ActionResult> {
  const { supabase } = await requireAuth()

  const { error } = await supabase.from('campaigns').delete().eq('id', id)
  if (error) return { success: false, error: error.message }

  revalidatePath('/campaigns')
  return { success: true, data: null }
}

// ── Duplicate ──

export async function duplicateCampaign(id: string): Promise<ActionResult<{ id: string }>> {
  const { supabase, orgId } = await requireAuth()

  const { data: original } = await supabase
    .from('campaigns')
    .select('name,subject,preview_text,from_name,from_email,reply_to,html_body,text_body,list_id,segment_id')
    .eq('id', id)
    .single()

  if (!original) return { success: false, error: 'キャンペーンが見つかりません' }

  const { data, error } = await supabase
    .from('campaigns')
    .insert({
      organization_id: orgId,
      name: `${original.name} (コピー)`,
      subject: original.subject,
      preview_text: original.preview_text,
      from_name: original.from_name,
      from_email: original.from_email,
      reply_to: original.reply_to,
      html_body: original.html_body,
      text_body: original.text_body,
      list_id: original.list_id,
      segment_id: original.segment_id,
      status: 'draft',
    })
    .select('id')
    .single()

  if (error) return { success: false, error: error.message }

  revalidatePath('/campaigns')
  return { success: true, data: { id: data.id } }
}

// ── Schedule ──

export async function scheduleCampaign(
  id: string,
  scheduledAt: string
): Promise<ActionResult> {
  const { supabase } = await requireAuth()

  const { data: campaign } = await supabase
    .from('campaigns')
    .select('status, list_id, from_email, subject, html_body')
    .eq('id', id)
    .single()

  if (!campaign) return { success: false, error: 'キャンペーンが見つかりません' }
  if (campaign.status !== 'draft') return { success: false, error: '下書きのみ予約できます' }
  if (!campaign.list_id) return { success: false, error: '送信先リストが設定されていません' }
  if (!campaign.from_email) return { success: false, error: '差出人メールが設定されていません' }
  if (!campaign.subject) return { success: false, error: '件名が設定されていません' }

  const scheduledDate = new Date(scheduledAt)
  if (scheduledDate <= new Date()) return { success: false, error: '未来の日時を指定してください' }

  const { error } = await supabase
    .from('campaigns')
    .update({ status: 'scheduled', scheduled_at: scheduledAt })
    .eq('id', id)

  if (error) return { success: false, error: error.message }

  revalidatePath('/campaigns')
  revalidatePath(`/campaigns/${id}`)
  return { success: true, data: null }
}

// ── Send (mark as sending - actual email dispatch would be a separate worker) ──

export async function sendCampaign(id: string): Promise<ActionResult> {
  const { supabase } = await requireAuth()

  const { data: campaign } = await supabase
    .from('campaigns')
    .select('status, list_id, from_email, subject, html_body, organization_id')
    .eq('id', id)
    .single()

  if (!campaign) return { success: false, error: 'キャンペーンが見つかりません' }
  if (campaign.status !== 'draft' && campaign.status !== 'scheduled') {
    return { success: false, error: '下書きまたは予約済のキャンペーンのみ送信できます' }
  }
  if (!campaign.list_id) return { success: false, error: '送信先リストが設定されていません' }
  if (!campaign.from_email) return { success: false, error: '差出人メールが設定されていません' }
  if (!campaign.subject) return { success: false, error: '件名が設定されていません' }
  if (!campaign.html_body) return { success: false, error: 'メール本文が空です' }

  // Count recipients
  const { count: recipientCount } = await supabase
    .from('list_contacts')
    .select('*', { count: 'exact', head: true })
    .eq('list_id', campaign.list_id)
    .eq('status', 'subscribed')

  // Check send quota
  const { data: org } = await supabase
    .from('organizations')
    .select('sends_this_month, monthly_send_limit')
    .eq('id', campaign.organization_id)
    .single()

  if (org) {
    const remaining = org.monthly_send_limit - org.sends_this_month
    if ((recipientCount ?? 0) > remaining) {
      return { success: false, error: `月次送信上限を超えます（残り: ${remaining}通、必要: ${recipientCount}通）` }
    }
  }

  const { error } = await supabase
    .from('campaigns')
    .update({
      status: 'sending',
      recipients_count: recipientCount ?? 0,
      sent_at: new Date().toISOString(),
    })
    .eq('id', id)

  if (error) return { success: false, error: error.message }

  // NOTE: Actual email dispatch (SES/Resend/Postmark integration) would be handled
  // by a background worker that polls for status='sending' campaigns.
  // For now we mark it as 'sent' to complete the flow.
  await supabase
    .from('campaigns')
    .update({ status: 'sent', sent_count: recipientCount ?? 0 })
    .eq('id', id)

  // Update org send count
  if (org) {
    await supabase
      .from('organizations')
      .update({ sends_this_month: org.sends_this_month + (recipientCount ?? 0) })
      .eq('id', campaign.organization_id)
  }

  revalidatePath('/campaigns')
  revalidatePath(`/campaigns/${id}`)
  revalidatePath('/dashboard')
  return { success: true, data: null }
}

// ── Cancel / Pause ──

export async function cancelCampaign(id: string): Promise<ActionResult> {
  const { supabase } = await requireAuth()

  const { data: campaign } = await supabase
    .from('campaigns')
    .select('status')
    .eq('id', id)
    .single()

  if (!campaign) return { success: false, error: 'キャンペーンが見つかりません' }
  if (campaign.status !== 'scheduled' && campaign.status !== 'sending') {
    return { success: false, error: '予約済または送信中のキャンペーンのみキャンセルできます' }
  }

  const { error } = await supabase
    .from('campaigns')
    .update({ status: 'cancelled', scheduled_at: null })
    .eq('id', id)

  if (error) return { success: false, error: error.message }

  revalidatePath('/campaigns')
  revalidatePath(`/campaigns/${id}`)
  return { success: true, data: null }
}
