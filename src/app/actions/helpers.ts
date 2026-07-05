'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

/**
 * Returns the authenticated user's ID and their organization_id.
 * Redirects to /login if not authenticated or no org found.
 */
export async function requireAuth() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: membership } = await supabase
    .from('memberships')
    .select('organization_id, role')
    .eq('user_id', user.id)
    .limit(1)
    .single()

  if (!membership) {
    redirect('/login')
  }

  return {
    supabase,
    userId: user.id,
    orgId: membership.organization_id as string,
    role: membership.role as 'owner' | 'admin' | 'sender',
  }
}

export type ActionResult<T = null> =
  | { success: true; data: T }
  | { success: false; error: string }
