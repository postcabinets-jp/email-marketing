import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'

const statusConfig: Record<string, { label: string; className: string }> = {
  draft:     { label: '下書き',   className: 'bg-gray-100 text-gray-600' },
  scheduled: { label: '予約済',   className: 'bg-blue-100 text-blue-700' },
  sending:   { label: '送信中',   className: 'bg-amber-100 text-amber-700' },
  sent:      { label: '送信済',   className: 'bg-emerald-100 text-emerald-700' },
  paused:    { label: '一時停止', className: 'bg-orange-100 text-orange-700' },
  cancelled: { label: 'キャンセル', className: 'bg-red-100 text-red-700' },
}

export default async function CampaignsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: membership } = await supabase
    .from('memberships')
    .select('organization_id')
    .eq('user_id', user.id)
    .limit(1)
    .single()

  const orgId = membership?.organization_id

  const { data: campaigns, count } = await supabase
    .from('campaigns')
    .select('id,name,subject,status,sent_at,scheduled_at,recipients_count,sent_count,open_count,click_count,created_at', { count: 'exact' })
    .eq('organization_id', orgId ?? '')
    .order('created_at', { ascending: false })
    .limit(50)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">キャンペーン</h1>
          <p className="text-sm text-gray-500 mt-0.5">{count?.toLocaleString() ?? 0} 件</p>
        </div>
        <Button size="sm" className="gap-1.5" asChild>
          <Link href="/campaigns/new">
            <Plus className="w-3.5 h-3.5" /> 新規作成
          </Link>
        </Button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-left px-4 py-2.5 font-medium text-gray-600 text-xs">キャンペーン名</th>
              <th className="text-left px-4 py-2.5 font-medium text-gray-600 text-xs">ステータス</th>
              <th className="text-right px-4 py-2.5 font-medium text-gray-600 text-xs">送信数</th>
              <th className="text-right px-4 py-2.5 font-medium text-gray-600 text-xs">開封率</th>
              <th className="text-right px-4 py-2.5 font-medium text-gray-600 text-xs">クリック率</th>
              <th className="text-right px-4 py-2.5 font-medium text-gray-600 text-xs">日時</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {campaigns?.map(c => {
              const cfg = statusConfig[c.status] ?? { label: c.status, className: 'bg-gray-100 text-gray-600' }
              const openRate = c.sent_count > 0 ? ((c.open_count / c.sent_count) * 100).toFixed(1) : '—'
              const clickRate = c.sent_count > 0 ? ((c.click_count / c.sent_count) * 100).toFixed(1) : '—'
              const date = c.sent_at ?? c.scheduled_at ?? c.created_at
              return (
                <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <Link href={`/campaigns/${c.id}`} className="font-medium text-gray-900 hover:text-blue-600 block">
                      {c.name}
                    </Link>
                    <p className="text-xs text-gray-400 mt-0.5 truncate max-w-xs">{c.subject}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${cfg.className}`}>
                      {cfg.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-gray-700">
                    {c.sent_count > 0 ? c.sent_count.toLocaleString() : '—'}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-700">{openRate}{openRate !== '—' ? '%' : ''}</td>
                  <td className="px-4 py-3 text-right text-gray-700">{clickRate}{clickRate !== '—' ? '%' : ''}</td>
                  <td className="px-4 py-3 text-right text-gray-400 text-xs">
                    {new Date(date).toLocaleDateString('ja-JP')}
                  </td>
                </tr>
              )
            })}
            {!campaigns?.length && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-sm text-gray-400">
                  まだキャンペーンがありません。
                  <Link href="/campaigns/new" className="text-blue-600 hover:underline ml-1">最初のキャンペーンを作成する</Link>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
