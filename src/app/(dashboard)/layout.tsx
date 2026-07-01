import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DashboardSidebar } from '@/components/dashboard/sidebar'
import { DashboardHeader } from '@/components/dashboard/header'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Get current org (first membership)
  const { data: membership } = await supabase
    .from('memberships')
    .select('role, organizations(id, name, slug, plan, monthly_send_limit, sends_this_month)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })
    .limit(1)
    .single()

  const org = (membership?.organizations as unknown) as { id: string; name: string; slug: string; plan: string; monthly_send_limit: number; sends_this_month: number } | null

  return (
    <div className="flex h-screen bg-gray-50">
      <DashboardSidebar orgName={org?.name ?? 'My Organization'} orgSlug={org?.slug ?? ''} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <DashboardHeader
          user={{ email: user.email ?? '', name: user.user_metadata?.full_name }}
          org={org ?? { id: '', name: '', slug: '', plan: 'free', monthly_send_limit: 50000, sends_this_month: 0 }}
        />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
