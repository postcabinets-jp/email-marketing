'use server'

import { revalidatePath } from 'next/cache'
import { requireAuth, type ActionResult } from './helpers'

// ── Create ──

export async function createWorkflow(
  data: {
    name: string
    trigger_type: 'list_subscribe' | 'tag_added' | 'date_field' | 'api_trigger' | 'link_click'
    trigger_config?: Record<string, unknown>
  }
): Promise<ActionResult<{ id: string }>> {
  const { supabase, orgId } = await requireAuth()

  if (!data.name) return { success: false, error: 'ワークフロー名は必須です' }

  const { data: workflow, error } = await supabase
    .from('workflows')
    .insert({
      organization_id: orgId,
      name: data.name,
      trigger_type: data.trigger_type,
      trigger_config: data.trigger_config ?? {},
      status: 'draft',
    })
    .select('id')
    .single()

  if (error) return { success: false, error: error.message }

  revalidatePath('/automations')
  return { success: true, data: { id: workflow.id } }
}

// ── Update ──

export async function updateWorkflow(
  id: string,
  fields: {
    name?: string
    trigger_type?: string
    trigger_config?: Record<string, unknown>
  }
): Promise<ActionResult> {
  const { supabase } = await requireAuth()

  const { error } = await supabase.from('workflows').update(fields).eq('id', id)
  if (error) return { success: false, error: error.message }

  revalidatePath('/automations')
  revalidatePath(`/automations/${id}`)
  return { success: true, data: null }
}

// ── Delete ──

export async function deleteWorkflow(id: string): Promise<ActionResult> {
  const { supabase } = await requireAuth()

  const { error } = await supabase.from('workflows').delete().eq('id', id)
  if (error) return { success: false, error: error.message }

  revalidatePath('/automations')
  return { success: true, data: null }
}

// ── Activate / Pause / Archive ──

export async function activateWorkflow(id: string): Promise<ActionResult> {
  const { supabase } = await requireAuth()

  const { data: workflow } = await supabase
    .from('workflows')
    .select('status')
    .eq('id', id)
    .single()

  if (!workflow) return { success: false, error: 'ワークフローが見つかりません' }
  if (workflow.status === 'active') return { success: false, error: '既に有効です' }

  const { error } = await supabase.from('workflows').update({ status: 'active' }).eq('id', id)
  if (error) return { success: false, error: error.message }

  revalidatePath('/automations')
  revalidatePath(`/automations/${id}`)
  return { success: true, data: null }
}

export async function pauseWorkflow(id: string): Promise<ActionResult> {
  const { supabase } = await requireAuth()

  const { error } = await supabase.from('workflows').update({ status: 'paused' }).eq('id', id)
  if (error) return { success: false, error: error.message }

  revalidatePath('/automations')
  revalidatePath(`/automations/${id}`)
  return { success: true, data: null }
}

// ── Workflow Steps ──

export async function addWorkflowStep(
  workflowId: string,
  step: {
    step_type: 'send_email' | 'delay' | 'add_tag' | 'remove_tag' | 'webhook'
    config: Record<string, unknown>
  }
): Promise<ActionResult<{ id: string }>> {
  const { supabase } = await requireAuth()

  // Get current max step_order
  const { data: existing } = await supabase
    .from('workflow_steps')
    .select('step_order')
    .eq('workflow_id', workflowId)
    .order('step_order', { ascending: false })
    .limit(1)

  const nextOrder = existing?.[0] ? existing[0].step_order + 1 : 1

  const { data, error } = await supabase
    .from('workflow_steps')
    .insert({
      workflow_id: workflowId,
      step_order: nextOrder,
      step_type: step.step_type,
      config: step.config,
    })
    .select('id')
    .single()

  if (error) return { success: false, error: error.message }

  revalidatePath(`/automations/${workflowId}`)
  return { success: true, data: { id: data.id } }
}

export async function updateWorkflowStep(
  stepId: string,
  fields: {
    step_type?: string
    config?: Record<string, unknown>
  }
): Promise<ActionResult> {
  const { supabase } = await requireAuth()

  const { error } = await supabase.from('workflow_steps').update(fields).eq('id', stepId)
  if (error) return { success: false, error: error.message }

  // We don't know the workflowId here, so revalidate broadly
  revalidatePath('/automations')
  return { success: true, data: null }
}

export async function deleteWorkflowStep(stepId: string, workflowId: string): Promise<ActionResult> {
  const { supabase } = await requireAuth()

  const { error } = await supabase.from('workflow_steps').delete().eq('id', stepId)
  if (error) return { success: false, error: error.message }

  revalidatePath(`/automations/${workflowId}`)
  return { success: true, data: null }
}
