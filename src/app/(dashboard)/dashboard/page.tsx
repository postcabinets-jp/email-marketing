import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Mail, Users, MousePointerClick, TrendingUp } from 'lucide-react'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: membership } = await supabase
    .from('memberships')
    .select('organization_id')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })
    .limit(1)
    .single()

  const orgId = membership?.organization_id

  const [
    { count: contactCount },
    { count: listCount },
    { data: recentCampaigns },
    { data: org },
  ] = await Promise.all([
    supabase.from('contacts').select('*', { count: 'exact', head: true }).eq('organization_id', orgId ?? '').eq('status', 'subscribed'),
    supabase.from('lists').select('*', { count: 'exact', head: true }).eq('organization_id', orgId ?? ''),
    supabase.from('campaigns').select('id,name,status,sent_at,sent_count,open_count,click_count').eq('organization_id', orgId ?? '').order('created_at', { ascending: false }).limit(5),
    supabase.from('organizations').select('*').eq('id', orgId ?? '').single(),
  ])

  const totalSent = recentCampaigns?.filter(c => c.status === 'sent').reduce((s, c) => s + c.sent_count, 0) ?? 0
  const totalOpens = recentCampaigns?.filter(c => c.status === 'sent').reduce((s, c) => s + c.open_count, 0) ?? 0
  const avgOpenRate = totalSent > 0 ? Math.round((totalOpens / totalSent) * 100) : 0

  const stats = [
    { label: '購読者数', value: (contactCount ?? 0).toLocaleString(), icon: Users, color: 'text-blue-600 bg-blue-50' },
    { label: '今月の送信数', value: (org?.sends_this_month ?? 0).toLocaleString(), icon: Mail, color: 'text-emerald-600 bg-emerald-50' },
    { label: '平均開封率', value: `${avgOpenRate}%`, icon: TrendingUp, color: 'text-amber-600 bg-amber-50' },
    { label: 'メーリングリスト', value: (listCount ?? 0).toLocaleString(), icon: MousePointerClick, color: 'text-purple-600 bg-purple-50' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">ダッシュボード</h1>
        <p className="text-sm text-gray-500 mt-0.5">{org?.name} のメールマーケティング概要</p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-lg border border-gray-200 p-4">
            <div className={`inline-flex p-2 rounded-md ${color} mb-3`}>
              <Icon className="w-4 h-4" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Send quota progress */}
      {org && (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-700">月次送信枠</p>
            <p className="text-sm text-gray-500">
              {org.sends_this_month.toLocaleString()} / {org.monthly_send_limit.toLocaleString()} 通
            </p>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                (org.sends_this_month / org.monthly_send_limit) > 0.9
                  ? 'bg-red-500'
                  : (org.sends_this_month / org.monthly_send_limit) > 0.7
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min((org.sends_this_month / org.monthly_send_limit) * 100, 100)}%` }}
            />
          </div>
          <p className="text-xs text-gray-400 mt-1">
            {org.plan === 'free' ? '無料プラン — 月5万通まで' : `${org.plan} プラン`}
          </p>
        </div>
      )}

      {/* Recent campaigns */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <h2 className="text-sm font-semibold text-gray-900">直近のキャンペーン</h2>
          <Link href="/campaigns" className="text-xs text-blue-600 hover:underline">すべて見る</Link>
        </div>
        <div className="divide-y divide-gray-100">
          {recentCampaigns && recentCampaigns.length > 0 ? recentCampaigns.map(c => {
            const openRate = c.sent_count > 0 ? Math.round((c.open_count / c.sent_count) * 100) : 0
            const clickRate = c.sent_count > 0 ? Math.round((c.click_count / c.sent_count) * 100) : 0
            return (
              <Link
                key={c.id}
                href={`/campaigns/${c.id}`}
                className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">{c.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {c.sent_at ? new Date(c.sent_at).toLocaleDateString('ja-JP') : '—'}
                  </p>
                </div>
                <div className="flex items-center gap-6 text-right">
                  <div>
                    <p className="text-xs text-gray-400">送信数</p>
                    <p className="text-sm font-medium">{c.sent_count.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">開封率</p>
                    <p className="text-sm font-medium">{openRate}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">クリック率</p>
                    <p className="text-sm font-medium">{clickRate}%</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    c.status === 'sent' ? 'bg-emerald-100 text-emerald-700'
                    : c.status === 'draft' ? 'bg-gray-100 text-gray-600'
                    : c.status === 'scheduled' ? 'bg-blue-100 text-blue-700'
                    : 'bg-amber-100 text-amber-700'
                  }`}>
                    {c.status === 'sent' ? '送信済' : c.status === 'draft' ? '下書き' : c.status === 'scheduled' ? '予約済' : c.status}
                  </span>
                </div>
              </Link>
            )
          }) : (
            <div className="px-4 py-8 text-center text-sm text-gray-400">
              まだキャンペーンがありません。
              <Link href="/campaigns/new" className="text-blue-600 hover:underline ml-1">最初のキャンペーンを作成する</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
