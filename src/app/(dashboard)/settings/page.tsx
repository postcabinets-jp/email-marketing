import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

const planDetails = {
  free:       { name: 'Free',       price: '¥0/月',       limit: '月5万通・1万連絡先まで' },
  starter:    { name: 'Starter',    price: '¥1,980/月',   limit: '月10万通まで' },
  business:   { name: 'Business',   price: '¥4,980/月',   limit: '月50万通まで' },
  enterprise: { name: 'Enterprise', price: '要問い合わせ', limit: '無制限' },
}

const settingsSections = [
  { href: '/settings/domains', label: '送信ドメイン認証', description: 'SPF / DKIM / DMARC の設定と確認' },
  { href: '/settings/api-keys', label: 'APIキー管理', description: 'トランザクションメール用APIキーの発行・管理' },
  { href: '/settings/team', label: 'チームメンバー', description: 'メンバーの招待・ロール管理' },
]

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: membership } = await supabase
    .from('memberships')
    .select('role, organizations(*)')
    .eq('user_id', user.id)
    .limit(1)
    .single()

  const org = (membership?.organizations as unknown) as Record<string, string | number> | null

  const plan = (org?.plan as string) ?? 'free'
  const planInfo = planDetails[plan as keyof typeof planDetails] ?? planDetails.free

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">設定</h1>
      </div>

      {/* Org info */}
      <div className="bg-white rounded-lg border border-gray-200 p-5 space-y-4">
        <h2 className="font-medium text-gray-900">組織情報</h2>
        <dl className="space-y-3 text-sm">
          <div className="flex gap-4">
            <dt className="w-32 text-gray-500 shrink-0">組織名</dt>
            <dd className="text-gray-900 font-medium">{org?.name as string ?? '—'}</dd>
          </div>
          <div className="flex gap-4">
            <dt className="w-32 text-gray-500 shrink-0">スラグ</dt>
            <dd className="text-gray-600 font-mono text-xs bg-gray-50 px-2 py-1 rounded">{org?.slug as string ?? '—'}</dd>
          </div>
          <div className="flex gap-4">
            <dt className="w-32 text-gray-500 shrink-0">あなたのロール</dt>
            <dd className="text-gray-900">{membership?.role ?? '—'}</dd>
          </div>
        </dl>
      </div>

      {/* Plan */}
      <div className="bg-white rounded-lg border border-gray-200 p-5 space-y-4">
        <h2 className="font-medium text-gray-900">プラン・請求</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-gray-900">{planInfo.name}</p>
            <p className="text-sm text-gray-500">{planInfo.limit}</p>
          </div>
          <div className="text-right">
            <p className="text-xl font-bold text-gray-900">{planInfo.price}</p>
          </div>
        </div>
        <div className="border-t border-gray-100 pt-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">今月の送信数</p>
            <p className="text-sm font-medium">{(org?.sends_this_month as number ?? 0).toLocaleString()} / {(org?.monthly_send_limit as number ?? 50000).toLocaleString()}</p>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full"
              style={{ width: `${Math.min(((org?.sends_this_month as number ?? 0) / (org?.monthly_send_limit as number ?? 50000)) * 100, 100)}%` }}
            />
          </div>
        </div>
        <button className="text-sm text-blue-600 hover:underline">プランをアップグレード</button>
      </div>

      {/* Settings links */}
      <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-100">
        {settingsSections.map(({ href, label, description }) => (
          <Link key={href} href={href} className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
            <div>
              <p className="text-sm font-medium text-gray-900">{label}</p>
              <p className="text-xs text-gray-500 mt-0.5">{description}</p>
            </div>
            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        ))}
      </div>
    </div>
  )
}
