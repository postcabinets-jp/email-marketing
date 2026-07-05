'use server'

import { revalidatePath } from 'next/cache'
import { randomBytes, createHash } from 'crypto'
import { requireAuth, type ActionResult } from './helpers'

// ── Organization ──

export async function updateOrganization(
  fields: { name?: string; slug?: string }
): Promise<ActionResult> {
  const { supabase, orgId, role } = await requireAuth()

  if (role !== 'owner' && role !== 'admin') {
    return { success: false, error: '管理者権限が必要です' }
  }

  const { error } = await supabase.from('organizations').update(fields).eq('id', orgId)
  if (error) {
    if (error.code === '23505') return { success: false, error: 'このスラグは既に使用されています' }
    return { success: false, error: error.message }
  }

  revalidatePath('/settings')
  return { success: true, data: null }
}

// ── Sending Domains ──

export async function addSendingDomain(domain: string): Promise<ActionResult<{ id: string }>> {
  const { supabase, orgId, role } = await requireAuth()

  if (role !== 'owner' && role !== 'admin') {
    return { success: false, error: '管理者権限が必要です' }
  }

  if (!domain) return { success: false, error: 'ドメインは必須です' }

  // Generate DKIM selector
  const dkimSelector = `mail${Date.now().toString(36).slice(-4)}`

  const { data, error } = await supabase
    .from('sending_domains')
    .insert({
      organization_id: orgId,
      domain,
      dkim_selector: dkimSelector,
    })
    .select('id')
    .single()

  if (error) {
    if (error.code === '23505') return { success: false, error: 'このドメインは既に登録されています' }
    return { success: false, error: error.message }
  }

  revalidatePath('/settings/domains')
  return { success: true, data: { id: data.id } }
}

export async function deleteSendingDomain(id: string): Promise<ActionResult> {
  const { supabase, role } = await requireAuth()

  if (role !== 'owner' && role !== 'admin') {
    return { success: false, error: '管理者権限が必要です' }
  }

  const { error } = await supabase.from('sending_domains').delete().eq('id', id)
  if (error) return { success: false, error: error.message }

  revalidatePath('/settings/domains')
  return { success: true, data: null }
}

// ── API Keys ──

export async function createApiKey(name: string): Promise<ActionResult<{ key: string }>> {
  const { supabase, orgId, role } = await requireAuth()

  if (role !== 'owner' && role !== 'admin') {
    return { success: false, error: '管理者権限が必要です' }
  }

  if (!name) return { success: false, error: 'キー名は必須です' }

  // Generate a random API key
  const rawKey = `em_${randomBytes(24).toString('base64url')}`
  const keyHash = createHash('sha256').update(rawKey).digest('hex')

  const { error } = await supabase.from('api_keys').insert({
    organization_id: orgId,
    name,
    key_hash: keyHash,
    expires_at: null,
  })

  if (error) return { success: false, error: error.message }

  revalidatePath('/settings/api-keys')
  // Return the raw key only once (it's hashed in DB)
  return { success: true, data: { key: rawKey } }
}

export async function deleteApiKey(id: string): Promise<ActionResult> {
  const { supabase, role } = await requireAuth()

  if (role !== 'owner' && role !== 'admin') {
    return { success: false, error: '管理者権限が必要です' }
  }

  const { error } = await supabase.from('api_keys').delete().eq('id', id)
  if (error) return { success: false, error: error.message }

  revalidatePath('/settings/api-keys')
  return { success: true, data: null }
}

// ── Team Members ──

export async function inviteTeamMember(
  email: string,
  role: 'admin' | 'sender'
): Promise<ActionResult> {
  const { supabase, orgId, role: currentRole } = await requireAuth()

  if (currentRole !== 'owner' && currentRole !== 'admin') {
    return { success: false, error: '管理者権限が必要です' }
  }

  // Look up user by email via admin API is not available with anon key.
  // For now, return an instruction to implement invite flow.
  // In a real implementation, you'd use Supabase auth.admin.inviteUserByEmail()
  // or create an invite link + invite table.
  return {
    success: false,
    error: 'メンバー招待にはSupabase Admin APIキーが必要です。サービスロールキーをサーバー環境変数に追加してください。',
  }
}

export async function removeTeamMember(membershipId: string): Promise<ActionResult> {
  const { supabase, role } = await requireAuth()

  if (role !== 'owner') {
    return { success: false, error: 'オーナー権限が必要です' }
  }

  const { error } = await supabase.from('memberships').delete().eq('id', membershipId)
  if (error) return { success: false, error: error.message }

  revalidatePath('/settings/team')
  return { success: true, data: null }
}

export async function updateMemberRole(
  membershipId: string,
  newRole: 'admin' | 'sender'
): Promise<ActionResult> {
  const { supabase, role } = await requireAuth()

  if (role !== 'owner') {
    return { success: false, error: 'オーナー権限が必要です' }
  }

  const { error } = await supabase
    .from('memberships')
    .update({ role: newRole })
    .eq('id', membershipId)

  if (error) return { success: false, error: error.message }

  revalidatePath('/settings/team')
  return { success: true, data: null }
}
