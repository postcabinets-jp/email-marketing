'use server'

import { revalidatePath } from 'next/cache'
import { requireAuth, type ActionResult } from './helpers'

// ── Create ──

export async function createSegment(
  data: {
    name: string
    conditions: Array<{ field: string; op: string; value: string }>
    match_type: 'all' | 'any'
  }
): Promise<ActionResult<{ id: string }>> {
  const { supabase, orgId } = await requireAuth()

  if (!data.name) return { success: false, error: 'セグメント名は必須です' }

  const { data: segment, error } = await supabase
    .from('segments')
    .insert({
      organization_id: orgId,
      name: data.name,
      conditions: data.conditions,
      match_type: data.match_type,
    })
    .select('id')
    .single()

  if (error) return { success: false, error: error.message }

  revalidatePath('/segments')
  return { success: true, data: { id: segment.id } }
}

// ── Update ──

export async function updateSegment(
  id: string,
  fields: {
    name?: string
    conditions?: Array<{ field: string; op: string; value: string }>
    match_type?: 'all' | 'any'
  }
): Promise<ActionResult> {
  const { supabase } = await requireAuth()

  const { error } = await supabase.from('segments').update(fields).eq('id', id)
  if (error) return { success: false, error: error.message }

  revalidatePath('/segments')
  return { success: true, data: null }
}

// ── Delete ──

export async function deleteSegment(id: string): Promise<ActionResult> {
  const { supabase } = await requireAuth()

  const { error } = await supabase.from('segments').delete().eq('id', id)
  if (error) return { success: false, error: error.message }

  revalidatePath('/segments')
  return { success: true, data: null }
}
