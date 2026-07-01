import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Plus, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'

const triggerLabels: Record<string, string> = {
  list_subscribe: 'リスト登録時',
  tag_added: 'タグ追加時',
  date_field: '日付フィールド',
  api_trigger: 'APIトリガー',
  link_click: 'リンククリック時',
}

const statusConfig: Record<string, { label: string; className: string }> = {
  draft:    { label: '下書き', className: 'bg-gray-100 text-gray-600' },
  active:   { label: '有効',   className: 'bg-emerald-100 text-emerald-700' },
  paused:   { label: '停止中', className: 'bg-amber-100 text-amber-700' },
  archived: { label: 'アーカイブ', className: 'bg-gray-100 text-gray-400' },
}

export default async function AutomationsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: membership } = await supabase
    .from('memberships').select('organization_id').eq('user_id', user.id).limit(1).single()
  const orgId = membership?.organization_id

  const { data: workflows } = await supabase
    .from('workflows')
    .select('id,name,trigger_type,status,enrolled_count,created_at,workflow_steps(count)')
    .eq('organization_id', orgId ?? '')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">オートメーション</h1>
          <p className="text-sm text-gray-500 mt-0.5">{workflows?.length ?? 0} 件</p>
        </div>
        <Button size="sm" className="gap-1.5" asChild>
          <Link href="/automations/new"><Plus className="w-3.5 h-3.5" /> 新規作成</Link>
        </Button>
      </div>

      <div className="space-y-3">
        {workflows?.map(w => {
          const cfg = statusConfig[w.status] ?? { label: w.status, className: 'bg-gray-100' }
          const stepCount = (w.workflow_steps as unknown as Array<{ count: number }>)?.[0]?.count ?? 0
          return (
            <Link key={w.id} href={`/automations/${w.id}`}>
              <div className="bg-white rounded-lg border border-gray-200 p-4 hover:border-gray-400 transition-colors flex items-center gap-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${w.status === 'active' ? 'bg-emerald-50' : 'bg-gray-50'}`}>
                  <Zap className={`w-5 h-5 ${w.status === 'active' ? 'text-emerald-600' : 'text-gray-400'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-gray-900">{w.name}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${cfg.className}`}>{cfg.label}</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">{triggerLabels[w.trigger_type] ?? w.trigger_type} · {stepCount} ステップ</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-lg font-bold text-gray-900">{w.enrolled_count.toLocaleString()}</p>
                  <p className="text-xs text-gray-400">エンロール済</p>
                </div>
              </div>
            </Link>
          )
        })}
        {!workflows?.length && (
          <div className="py-16 text-center text-sm text-gray-400 bg-white rounded-lg border border-gray-200">
            まだワークフローがありません。
            <Link href="/automations/new" className="text-blue-600 hover:underline ml-1">最初のワークフローを作成する</Link>
          </div>
        )}
      </div>
    </div>
  )
}
