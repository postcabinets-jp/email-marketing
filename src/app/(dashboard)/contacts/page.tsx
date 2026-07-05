import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Plus, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DeleteContactButton, ImportContactsButton } from './client'

const statusStyles: Record<string, string> = {
  subscribed: 'bg-emerald-100 text-emerald-700',
  unsubscribed: 'bg-gray-100 text-gray-600',
  bounced: 'bg-red-100 text-red-700',
  complained: 'bg-orange-100 text-orange-700',
  pending: 'bg-blue-100 text-blue-700',
}

const statusLabels: Record<string, string> = {
  subscribed: '購読中',
  unsubscribed: '購読解除',
  bounced: 'バウンス',
  complained: 'スパム報告',
  pending: '確認待ち',
}

export default async function ContactsPage() {
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

  const { data: contacts, count } = await supabase
    .from('contacts')
    .select('id,email,first_name,last_name,status,source,created_at,contact_tags(tags(name,color))', { count: 'exact' })
    .eq('organization_id', orgId ?? '')
    .order('created_at', { ascending: false })
    .limit(50)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">連絡先</h1>
          <p className="text-sm text-gray-500 mt-0.5">{count?.toLocaleString() ?? 0} 件</p>
        </div>
        <div className="flex items-center gap-2">
          <ImportContactsButton />
          <Button size="sm" className="gap-1.5" asChild>
            <Link href="/contacts/new">
              <Plus className="w-3.5 h-3.5" /> 追加
            </Link>
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-left px-4 py-2.5 font-medium text-gray-600 text-xs">メールアドレス</th>
              <th className="text-left px-4 py-2.5 font-medium text-gray-600 text-xs">名前</th>
              <th className="text-left px-4 py-2.5 font-medium text-gray-600 text-xs">ステータス</th>
              <th className="text-left px-4 py-2.5 font-medium text-gray-600 text-xs">タグ</th>
              <th className="text-left px-4 py-2.5 font-medium text-gray-600 text-xs">追加日</th>
              <th className="w-10"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {contacts?.map(c => {
              const tags = (c.contact_tags as unknown as Array<{ tags: { name: string; color: string | null } }>)
              return (
                <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <Link href={`/contacts/${c.id}`} className="text-blue-600 hover:underline font-medium">
                      {c.email}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {c.first_name || c.last_name ? `${c.first_name ?? ''} ${c.last_name ?? ''}`.trim() : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusStyles[c.status] ?? 'bg-gray-100'}`}>
                      {statusLabels[c.status] ?? c.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {tags?.map(({ tags: tag }) => (
                        <Badge
                          key={tag.name}
                          variant="outline"
                          className="text-xs px-1.5 py-0"
                          style={tag.color ? { borderColor: tag.color, color: tag.color } : {}}
                        >
                          {tag.name}
                        </Badge>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">
                    {new Date(c.created_at).toLocaleDateString('ja-JP')}
                  </td>
                  <td className="px-4 py-2">
                    <DeleteContactButton id={c.id} email={c.email} />
                  </td>
                </tr>
              )
            })}
            {!contacts?.length && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-sm text-gray-400">
                  連絡先がありません。CSVインポートまたは手動追加してください。
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
