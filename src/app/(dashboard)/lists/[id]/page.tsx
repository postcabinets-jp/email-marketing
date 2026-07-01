import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default async function ListDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: list } = await supabase
    .from('lists')
    .select('*')
    .eq('id', id)
    .single()

  if (!list) notFound()

  const { data: members, count } = await supabase
    .from('list_contacts')
    .select('contact_id,status,joined_at,contacts(email,first_name,last_name)', { count: 'exact' })
    .eq('list_id', id)
    .order('joined_at', { ascending: false })
    .limit(50)

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/lists"><ArrowLeft className="w-4 h-4" /></Link>
        </Button>
        <div>
          <h1 className="text-xl font-semibold text-gray-900">{list.name}</h1>
          <p className="text-sm text-gray-500">{count?.toLocaleString() ?? 0} 人の購読者</p>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-5 space-y-3">
        <h2 className="font-medium text-gray-900">設定</h2>
        <dl className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
          {[
            ['ダブルオプトイン', list.double_optin ? '有効' : '無効'],
            ['差出人名', list.from_name ?? '—'],
            ['差出人メール', list.from_email ?? '—'],
            ['作成日', new Date(list.created_at).toLocaleDateString('ja-JP')],
          ].map(([k, v]) => (
            <div key={k} className="flex gap-4">
              <dt className="w-36 text-gray-500 shrink-0">{k}</dt>
              <dd className="text-gray-900">{v}</dd>
            </div>
          ))}
        </dl>
      </div>

      {list.description && (
        <div className="bg-white rounded-lg border border-gray-200 p-4 text-sm text-gray-600">{list.description}</div>
      )}

      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-4 py-3 border-b border-gray-200">
          <h2 className="text-sm font-semibold text-gray-900">購読者一覧</h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left px-4 py-2 font-medium text-gray-500 text-xs">メール</th>
              <th className="text-left px-4 py-2 font-medium text-gray-500 text-xs">名前</th>
              <th className="text-left px-4 py-2 font-medium text-gray-500 text-xs">ステータス</th>
              <th className="text-left px-4 py-2 font-medium text-gray-500 text-xs">登録日</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {members?.map(m => {
              const c = m.contacts as unknown as { email: string; first_name?: string; last_name?: string }
              return (
                <tr key={m.contact_id} className="hover:bg-gray-50">
                  <td className="px-4 py-2.5">
                    <Link href={`/contacts/${m.contact_id}`} className="text-blue-600 hover:underline">{c?.email}</Link>
                  </td>
                  <td className="px-4 py-2.5 text-gray-600">{`${c?.first_name ?? ''} ${c?.last_name ?? ''}`.trim() || '—'}</td>
                  <td className="px-4 py-2.5">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${m.status === 'subscribed' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>{m.status}</span>
                  </td>
                  <td className="px-4 py-2.5 text-gray-400 text-xs">{new Date(m.joined_at).toLocaleDateString('ja-JP')}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
