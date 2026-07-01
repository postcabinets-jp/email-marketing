import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

const statusLabels: Record<string, string> = {
  subscribed: '購読中', unsubscribed: '購読解除', bounced: 'バウンス', complained: 'スパム報告', pending: '確認待ち',
}

export default async function ContactDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: contact } = await supabase
    .from('contacts')
    .select('*,contact_tags(tags(name,color))')
    .eq('id', id)
    .single()

  if (!contact) notFound()

  const { data: events } = await supabase
    .from('email_events')
    .select('event_type,occurred_at,campaigns(name)')
    .eq('contact_id', id)
    .order('occurred_at', { ascending: false })
    .limit(20)

  const tags = contact.contact_tags as unknown as Array<{ tags: { name: string; color: string | null } }>

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/contacts"><ArrowLeft className="w-4 h-4" /></Link>
        </Button>
        <h1 className="text-xl font-semibold text-gray-900">{contact.email}</h1>
        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{statusLabels[contact.status] ?? contact.status}</span>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-5 space-y-4">
        <h2 className="font-medium text-gray-900">基本情報</h2>
        <dl className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
          {[
            ['名前', `${contact.first_name ?? ''} ${contact.last_name ?? ''}`.trim() || '—'],
            ['メール', contact.email],
            ['電話', contact.phone ?? '—'],
            ['ソース', contact.source ?? '—'],
            ['登録日', new Date(contact.created_at).toLocaleDateString('ja-JP')],
            ['更新日', new Date(contact.updated_at).toLocaleDateString('ja-JP')],
          ].map(([k, v]) => (
            <div key={k} className="flex gap-4">
              <dt className="w-24 text-gray-500 shrink-0">{k}</dt>
              <dd className="text-gray-900">{v}</dd>
            </div>
          ))}
        </dl>
        {tags?.length > 0 && (
          <div className="flex gap-1.5 flex-wrap pt-2 border-t border-gray-100">
            {tags.map(({ tags: tag }) => (
              <Badge key={tag.name} variant="outline" className="text-xs" style={tag.color ? { borderColor: tag.color, color: tag.color } : {}}>
                {tag.name}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {Object.keys(contact.custom_fields ?? {}).length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-5 space-y-3">
          <h2 className="font-medium text-gray-900">カスタムフィールド</h2>
          <dl className="space-y-2 text-sm">
            {Object.entries(contact.custom_fields as Record<string, string>).map(([k, v]) => (
              <div key={k} className="flex gap-4">
                <dt className="w-40 text-gray-500 shrink-0 font-mono text-xs">{k}</dt>
                <dd className="text-gray-900">{String(v)}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}

      {events && events.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-4 py-3 border-b border-gray-200">
            <h2 className="text-sm font-semibold text-gray-900">アクティビティ</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {events.map((e, i) => {
              const campaign = e.campaigns as unknown as { name: string } | null
              return (
                <div key={i} className="flex items-center gap-4 px-4 py-2.5 text-sm">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                    e.event_type === 'opened' ? 'bg-blue-50 text-blue-700'
                    : e.event_type === 'clicked' ? 'bg-emerald-50 text-emerald-700'
                    : e.event_type === 'bounced' ? 'bg-red-50 text-red-700'
                    : 'bg-gray-50 text-gray-600'
                  }`}>{e.event_type}</span>
                  {campaign && <span className="text-gray-600">{campaign.name}</span>}
                  <span className="text-xs text-gray-400 ml-auto">{new Date(e.occurred_at).toLocaleString('ja-JP')}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
