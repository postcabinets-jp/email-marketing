import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, CheckCircle, XCircle, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AddDomainForm, DeleteDomainButton } from './client'

function StatusIcon({ status }: { status: string }) {
  if (status === 'verified') return <CheckCircle className="w-4 h-4 text-emerald-500" />
  if (status === 'failed') return <XCircle className="w-4 h-4 text-red-500" />
  return <Clock className="w-4 h-4 text-amber-500" />
}

const statusLabel: Record<string, string> = {
  verified: '認証済', failed: '失敗', pending: '未確認', not_set: '未設定',
}

export default async function DomainsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: membership } = await supabase
    .from('memberships').select('organization_id').eq('user_id', user.id).limit(1).single()
  const orgId = membership?.organization_id

  const { data: domains } = await supabase
    .from('sending_domains')
    .select('*')
    .eq('organization_id', orgId ?? '')
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/settings"><ArrowLeft className="w-4 h-4" /></Link>
        </Button>
        <div>
          <h1 className="text-xl font-semibold text-gray-900">送信ドメイン認証</h1>
          <p className="text-sm text-gray-500 mt-0.5">SPF · DKIM · DMARC を設定して配信品質を向上させます</p>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800">
        認証されていないドメインからの送信はブロックされます。カスタムドメインを追加してください。
      </div>

      {domains?.map(d => (
        <div key={d.id} className="bg-white rounded-lg border border-gray-200 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 font-mono">{d.domain}</h3>
            {d.verified_at && (
              <span className="text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                {new Date(d.verified_at).toLocaleDateString('ja-JP')} 認証済
              </span>
            )}
            <DeleteDomainButton id={d.id} domain={d.domain} />
          </div>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'SPF', status: d.spf_status },
              { label: 'DKIM', status: d.dkim_status },
              { label: 'DMARC', status: d.dmarc_status },
            ].map(({ label, status }) => (
              <div key={label} className="flex items-center gap-2 bg-gray-50 rounded-lg p-3">
                <StatusIcon status={status} />
                <div>
                  <p className="text-xs font-medium text-gray-900">{label}</p>
                  <p className="text-xs text-gray-500">{statusLabel[status] ?? status}</p>
                </div>
              </div>
            ))}
          </div>
          {d.dkim_selector && (
            <div className="text-xs text-gray-500 bg-gray-50 rounded p-3 font-mono">
              セレクタ: {d.dkim_selector}._domainkey.{d.domain}
            </div>
          )}
        </div>
      ))}

      {!domains?.length && (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center text-sm text-gray-400">
          ドメインがまだ追加されていません。
        </div>
      )}

      <div className="bg-white rounded-lg border border-gray-200 p-5 space-y-3">
        <h3 className="font-medium text-gray-900">ドメインを追加</h3>
        <p className="text-sm text-gray-500">DNS に以下のレコードを追加することで送信ドメインを認証できます。</p>
        <div className="bg-gray-50 rounded-lg p-4 text-xs font-mono space-y-1 text-gray-600">
          <p>SPF:   v=spf1 include:spf.your-esp.com ~all</p>
          <p>DKIM:  mail._domainkey TXT v=DKIM1; k=rsa; p=...</p>
          <p>DMARC: _dmarc TXT v=DMARC1; p=quarantine;</p>
        </div>
        <AddDomainForm />
      </div>
    </div>
  )
}
