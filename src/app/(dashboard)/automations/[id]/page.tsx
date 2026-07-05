import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { WorkflowActions } from './client'

const stepTypeLabels: Record<string, string> = {
  send_email: 'メール送信', delay: '遅延', add_tag: 'タグ追加', remove_tag: 'タグ削除', webhook: 'Webhook',
}

const triggerLabels: Record<string, string> = {
  list_subscribe: 'リスト登録時', tag_added: 'タグ追加時', date_field: '日付フィールド', api_trigger: 'APIトリガー', link_click: 'リンククリック時',
}

export default async function AutomationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: workflow } = await supabase
    .from('workflows')
    .select('*,workflow_steps(*)')
    .eq('id', id)
    .single()

  if (!workflow) notFound()

  const { data: enrollments, count } = await supabase
    .from('workflow_enrollments')
    .select('status,enrolled_at,contacts(email)', { count: 'exact' })
    .eq('workflow_id', id)
    .order('enrolled_at', { ascending: false })
    .limit(20)

  const steps = (workflow.workflow_steps as Array<{ step_order: number; step_type: string; config: Record<string, string> }>)
    .sort((a, b) => a.step_order - b.step_order)

  const statusConfig: Record<string, { label: string; className: string }> = {
    draft: { label: '下書き', className: 'bg-gray-100 text-gray-600' },
    active: { label: '有効', className: 'bg-emerald-100 text-emerald-700' },
    paused: { label: '停止中', className: 'bg-amber-100 text-amber-700' },
    archived: { label: 'アーカイブ', className: 'bg-gray-100 text-gray-400' },
  }
  const cfg = statusConfig[workflow.status] ?? statusConfig.draft

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/automations"><ArrowLeft className="w-4 h-4" /></Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold text-gray-900">{workflow.name}</h1>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${cfg.className}`}>{cfg.label}</span>
          </div>
          <p className="text-sm text-gray-500">トリガー: {triggerLabels[workflow.trigger_type] ?? workflow.trigger_type}</p>
        </div>
        <p className="text-right">
          <span className="text-2xl font-bold text-gray-900">{count?.toLocaleString() ?? 0}</span>
          <span className="text-xs text-gray-400 block">エンロール済</span>
        </p>
      </div>

      <WorkflowActions workflowId={id} status={workflow.status} />

      {/* Steps */}
      <div className="bg-white rounded-lg border border-gray-200 p-5 space-y-4">
        <h2 className="font-medium text-gray-900">ステップ ({steps.length})</h2>
        <div className="space-y-3">
          {steps.map((s, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600 shrink-0 mt-0.5">
                {s.step_order}
              </div>
              <div className="flex-1 bg-gray-50 rounded-lg p-3">
                <p className="text-sm font-medium text-gray-900">{stepTypeLabels[s.step_type] ?? s.step_type}</p>
                <p className="text-xs text-gray-400 mt-0.5">{JSON.stringify(s.config)}</p>
              </div>
            </div>
          ))}
          {steps.length === 0 && (
            <p className="text-sm text-gray-400">まだステップがありません。</p>
          )}
        </div>
      </div>

      {/* Enrollments */}
      {enrollments && enrollments.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-4 py-3 border-b border-gray-200">
            <h2 className="text-sm font-semibold text-gray-900">最近のエンロール</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {enrollments.map((e, i) => {
              const contact = e.contacts as unknown as { email: string } | null
              return (
                <div key={i} className="flex items-center justify-between px-4 py-2.5 text-sm">
                  <span className="text-gray-700">{contact?.email}</span>
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-0.5 rounded text-xs ${e.status === 'active' ? 'bg-emerald-50 text-emerald-700' : e.status === 'completed' ? 'bg-blue-50 text-blue-700' : 'bg-gray-50 text-gray-600'}`}>{e.status}</span>
                    <span className="text-xs text-gray-400">{new Date(e.enrolled_at).toLocaleDateString('ja-JP')}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
