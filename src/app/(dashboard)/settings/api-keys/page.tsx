import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Plus, Key } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default async function ApiKeysPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: membership } = await supabase
    .from('memberships').select('organization_id').eq('user_id', user.id).limit(1).single()
  const orgId = membership?.organization_id

  const { data: keys } = await supabase
    .from('api_keys')
    .select('id,name,last_used_at,expires_at,created_at')
    .eq('organization_id', orgId ?? '')
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/settings"><ArrowLeft className="w-4 h-4" /></Link>
        </Button>
        <div>
          <h1 className="text-xl font-semibold text-gray-900">APIキー管理</h1>
          <p className="text-sm text-gray-500 mt-0.5">トランザクションメール送信用のAPIキー</p>
        </div>
      </div>

      {/* API reference snippet */}
      <div className="bg-gray-900 rounded-lg p-4 text-xs font-mono text-gray-300 space-y-1">
        <p className="text-gray-500"># トランザクションメール送信例</p>
        <p>curl -X POST https://your-domain.com/v1/transactional/send \</p>
        <p className="pl-4">-H &apos;Authorization: Bearer YOUR_API_KEY&apos; \</p>
        <p className="pl-4">-H &apos;Content-Type: application/json&apos; \</p>
        <p className="pl-4">-d &apos;&#123;&quot;to&quot;:&quot;user@example.com&quot;,&quot;subject&quot;:&quot;注文確認&quot;,&quot;template_id&quot;:&quot;...&quot;&#125;&apos;</p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <h2 className="text-sm font-semibold text-gray-900">発行済みキー ({keys?.length ?? 0})</h2>
          <Button size="sm" className="gap-1.5">
            <Plus className="w-3.5 h-3.5" /> 新規発行
          </Button>
        </div>
        <div className="divide-y divide-gray-100">
          {keys?.map(k => (
            <div key={k.id} className="flex items-center gap-4 px-4 py-3">
              <Key className="w-4 h-4 text-gray-400 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">{k.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  作成: {new Date(k.created_at).toLocaleDateString('ja-JP')}
                  {k.last_used_at && ` · 最終使用: ${new Date(k.last_used_at).toLocaleDateString('ja-JP')}`}
                </p>
              </div>
              <span className="text-xs font-mono text-gray-400 bg-gray-50 px-2 py-1 rounded">••••••••••••••••</span>
              <button className="text-xs text-red-600 hover:underline">削除</button>
            </div>
          ))}
          {!keys?.length && (
            <div className="px-4 py-8 text-center text-sm text-gray-400">
              APIキーがまだありません。「新規発行」から作成してください。
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
