import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'

const roleLabels: Record<string, { label: string; description: string }> = {
  owner: { label: 'オーナー', description: '全機能・請求管理' },
  admin: { label: '管理者', description: '連絡先・キャンペーン管理' },
  sender: { label: '送信者', description: 'キャンペーン作成・送信のみ' },
}

export default async function TeamPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: membership } = await supabase
    .from('memberships').select('organization_id,role').eq('user_id', user.id).limit(1).single()
  const orgId = membership?.organization_id

  const { data: members } = await supabase
    .from('memberships')
    .select('id,role,created_at,profiles(full_name,avatar_url),user_id')
    .eq('organization_id', orgId ?? '')
    .order('created_at', { ascending: true })

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/settings"><ArrowLeft className="w-4 h-4" /></Link>
        </Button>
        <div>
          <h1 className="text-xl font-semibold text-gray-900">チームメンバー</h1>
          <p className="text-sm text-gray-500 mt-0.5">{members?.length ?? 0} 人</p>
        </div>
        {(membership?.role === 'owner' || membership?.role === 'admin') && (
          <Button size="sm" className="gap-1.5 ml-auto">
            <UserPlus className="w-3.5 h-3.5" /> メンバーを招待
          </Button>
        )}
      </div>

      <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-100">
        {members?.map(m => {
          const profile = m.profiles as unknown as { full_name?: string; avatar_url?: string } | null
          const initials = (profile?.full_name ?? m.user_id).slice(0, 2).toUpperCase()
          const roleInfo = roleLabels[m.role] ?? { label: m.role, description: '' }
          const isCurrentUser = m.user_id === user.id
          return (
            <div key={m.id} className="flex items-center gap-4 px-4 py-3">
              <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-sm font-semibold text-gray-700 shrink-0">
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">
                  {profile?.full_name ?? 'ユーザー'}
                  {isCurrentUser && <span className="ml-2 text-xs text-gray-400">（あなた）</span>}
                </p>
                <p className="text-xs text-gray-400">参加: {new Date(m.created_at).toLocaleDateString('ja-JP')}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-xs font-medium text-gray-700">{roleInfo.label}</p>
                <p className="text-xs text-gray-400">{roleInfo.description}</p>
              </div>
            </div>
          )
        })}
      </div>

      <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 text-xs text-gray-500 space-y-1">
        <p><strong className="text-gray-700">オーナー</strong> — 全機能・プラン・請求管理・メンバー管理</p>
        <p><strong className="text-gray-700">管理者</strong> — 連絡先・リスト・キャンペーン・テンプレート管理</p>
        <p><strong className="text-gray-700">送信者</strong> — キャンペーン作成・送信のみ（請求・メンバー変更不可）</p>
      </div>
    </div>
  )
}
