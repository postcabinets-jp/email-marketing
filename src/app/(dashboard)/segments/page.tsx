import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Plus, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default async function SegmentsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: membership } = await supabase
    .from('memberships').select('organization_id').eq('user_id', user.id).limit(1).single()
  const orgId = membership?.organization_id

  const { data: segments } = await supabase
    .from('segments')
    .select('id,name,conditions,match_type,created_at')
    .eq('organization_id', orgId ?? '')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">セグメント</h1>
          <p className="text-sm text-gray-500 mt-0.5">{segments?.length ?? 0} 件</p>
        </div>
        <Button size="sm" className="gap-1.5" asChild>
          <Link href="/segments/new"><Plus className="w-3.5 h-3.5" /> 新規作成</Link>
        </Button>
      </div>

      <div className="space-y-3">
        {segments?.map(s => {
          const conditions = s.conditions as Array<{ field: string; op: string; value: string | number }>
          return (
            <div key={s.id} className="bg-white rounded-lg border border-gray-200 p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center shrink-0">
                <Filter className="w-5 h-5 text-purple-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-gray-900">{s.name}</h3>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {conditions.map((c, i) => (
                    <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                      {c.field} {c.op} {String(c.value)}
                    </span>
                  ))}
                  {conditions.length > 1 && (
                    <span className="text-xs text-gray-400 px-1">
                      ({s.match_type === 'all' ? 'すべて一致' : 'いずれか一致'})
                    </span>
                  )}
                </div>
              </div>
              <span className="text-xs text-gray-400 shrink-0">
                {new Date(s.created_at).toLocaleDateString('ja-JP')}
              </span>
            </div>
          )
        })}
        {!segments?.length && (
          <div className="py-16 text-center text-sm text-gray-400 bg-white rounded-lg border border-gray-200">
            まだセグメントがありません。条件を設定してダイナミックセグメントを作成できます。
          </div>
        )}
      </div>
    </div>
  )
}
