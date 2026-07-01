import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default async function CampaignDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: campaign } = await supabase
    .from('campaigns')
    .select('*')
    .eq('id', id)
    .single()

  if (!campaign) notFound()

  const { data: events } = await supabase
    .from('email_events')
    .select('event_type, occurred_at, metadata, contacts(email,first_name,last_name)')
    .eq('campaign_id', id)
    .order('occurred_at', { ascending: false })
    .limit(20)

  const openRate = campaign.sent_count > 0 ? ((campaign.open_count / campaign.sent_count) * 100).toFixed(1) : '0'
  const clickRate = campaign.sent_count > 0 ? ((campaign.click_count / campaign.sent_count) * 100).toFixed(1) : '0'
  const bounceRate = campaign.sent_count > 0 ? ((campaign.bounce_count / campaign.sent_count) * 100).toFixed(1) : '0'
  const unsubRate = campaign.sent_count > 0 ? ((campaign.unsubscribe_count / campaign.sent_count) * 100).toFixed(1) : '0'

  const statusConfig: Record<string, { label: string; className: string }> = {
    draft:     { label: '下書き',   className: 'bg-gray-100 text-gray-600' },
    scheduled: { label: '予約済',   className: 'bg-blue-100 text-blue-700' },
    sending:   { label: '送信中',   className: 'bg-amber-100 text-amber-700' },
    sent:      { label: '送信済',   className: 'bg-emerald-100 text-emerald-700' },
    paused:    { label: '一時停止', className: 'bg-orange-100 text-orange-700' },
    cancelled: { label: 'キャンセル', className: 'bg-red-100 text-red-700' },
  }
  const cfg = statusConfig[campaign.status] ?? { label: campaign.status, className: 'bg-gray-100' }

  const eventLabels: Record<string, string> = {
    sent: '送信', delivered: '配信', opened: '開封', clicked: 'クリック',
    bounced: 'バウンス', complained: 'スパム報告', unsubscribed: '購読解除',
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-start gap-3">
        <Button variant="ghost" size="sm" asChild className="mt-0.5">
          <Link href="/campaigns">
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold text-gray-900">{campaign.name}</h1>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${cfg.className}`}>{cfg.label}</span>
          </div>
          <p className="text-sm text-gray-500 mt-0.5">{campaign.subject}</p>
        </div>
        {campaign.status === 'draft' && (
          <Button size="sm" asChild>
            <Link href={`/editor/${id}`}>
              <ExternalLink className="w-3.5 h-3.5 mr-1.5" /> エディタで編集
            </Link>
          </Button>
        )}
      </div>

      {/* Stats */}
      {campaign.status === 'sent' && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: '送信数', value: campaign.sent_count.toLocaleString() },
            { label: '開封率', value: `${openRate}%` },
            { label: 'クリック率', value: `${clickRate}%` },
            { label: 'バウンス率', value: `${bounceRate}%` },
            { label: '購読解除率', value: `${unsubRate}%` },
            { label: '開封数', value: campaign.open_count.toLocaleString() },
            { label: 'クリック数', value: campaign.click_count.toLocaleString() },
            { label: 'バウンス数', value: campaign.bounce_count.toLocaleString() },
          ].map(({ label, value }) => (
            <div key={label} className="bg-white rounded-lg border border-gray-200 p-4">
              <p className="text-xs text-gray-500">{label}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Campaign details */}
      <div className="bg-white rounded-lg border border-gray-200 p-5">
        <h2 className="font-medium text-gray-900 mb-4">キャンペーン情報</h2>
        <dl className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
          {[
            ['差出人', `${campaign.from_name} <${campaign.from_email}>`],
            ['返信先', campaign.reply_to ?? '—'],
            ['作成日', new Date(campaign.created_at).toLocaleString('ja-JP')],
            ['送信日', campaign.sent_at ? new Date(campaign.sent_at).toLocaleString('ja-JP') : '—'],
            ['予約日時', campaign.scheduled_at ? new Date(campaign.scheduled_at).toLocaleString('ja-JP') : '—'],
            ['受信者数', campaign.recipients_count.toLocaleString()],
          ].map(([k, v]) => (
            <div key={k} className="flex gap-4">
              <dt className="w-28 text-gray-500 shrink-0">{k}</dt>
              <dd className="text-gray-900">{v}</dd>
            </div>
          ))}
        </dl>
      </div>

      {/* Recent events */}
      {events && events.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-4 py-3 border-b border-gray-200">
            <h2 className="text-sm font-semibold text-gray-900">最近のアクティビティ</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {events.map((e, i) => {
              const contact = e.contacts as unknown as { email: string; first_name?: string; last_name?: string }
              return (
                <div key={i} className="flex items-center justify-between px-4 py-2.5 text-sm">
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      e.event_type === 'opened' ? 'bg-blue-50 text-blue-700'
                      : e.event_type === 'clicked' ? 'bg-emerald-50 text-emerald-700'
                      : e.event_type === 'bounced' ? 'bg-red-50 text-red-700'
                      : 'bg-gray-50 text-gray-600'
                    }`}>
                      {eventLabels[e.event_type] ?? e.event_type}
                    </span>
                    <span className="text-gray-700">{contact?.email}</span>
                    {(e.metadata as Record<string, string>)?.url && (
                      <span className="text-xs text-gray-400 truncate max-w-xs">{(e.metadata as Record<string, string>).url}</span>
                    )}
                  </div>
                  <span className="text-xs text-gray-400">
                    {new Date(e.occurred_at).toLocaleString('ja-JP')}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
