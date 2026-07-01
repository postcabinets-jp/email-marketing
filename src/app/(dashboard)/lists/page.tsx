import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default async function ListsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: membership } = await supabase
    .from('memberships').select('organization_id').eq('user_id', user.id).limit(1).single()
  const orgId = membership?.organization_id

  const { data: lists } = await supabase
    .from('lists')
    .select('id,name,description,subscriber_count,double_optin,from_email,created_at')
    .eq('organization_id', orgId ?? '')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">メーリングリスト</h1>
          <p className="text-sm text-gray-500 mt-0.5">{lists?.length ?? 0} 件</p>
        </div>
        <Button size="sm" className="gap-1.5" asChild>
          <Link href="/lists/new"><Plus className="w-3.5 h-3.5" /> 新規作成</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {lists?.map(l => (
          <Link key={l.id} href={`/lists/${l.id}`}>
            <div className="bg-white rounded-lg border border-gray-200 p-5 hover:border-gray-400 transition-colors">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-gray-900">{l.name}</h3>
                {l.double_optin && (
                  <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">ダブルオプトイン</span>
                )}
              </div>
              {l.description && <p className="text-xs text-gray-500 mb-3 line-clamp-2">{l.description}</p>}
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span className="text-2xl font-bold text-gray-900">{l.subscriber_count.toLocaleString()}</span>
                <span>購読者</span>
              </div>
              {l.from_email && <p className="text-xs text-gray-400 mt-2 truncate">{l.from_email}</p>}
            </div>
          </Link>
        ))}
        {!lists?.length && (
          <div className="col-span-3 py-16 text-center text-sm text-gray-400">
            まだリストがありません。
            <Link href="/lists/new" className="text-blue-600 hover:underline ml-1">最初のリストを作成する</Link>
          </div>
        )}
      </div>
    </div>
  )
}
