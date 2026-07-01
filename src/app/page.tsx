import Link from 'next/link'
import { Mail, CheckCircle, TrendingUp, Shield, Zap, Users, BarChart3, Globe } from 'lucide-react'

const features = [
  { icon: Users, title: '1万件まで無料', description: 'Mailchimpの40倍。非アクティブな連絡先を保持しても課金されない送信数ベースの料金体系。' },
  { icon: TrendingUp, title: '送信数課金', description: 'リストが大きくなっても自動値上げなし。月5万通まで無料、追加は1通あたり¥0.04。' },
  { icon: Zap, title: 'ドリップオートメーション', description: '登録・タグ追加・日付トリガーによるステップシーケンス。最大20ステップ対応。' },
  { icon: Mail, title: 'トランザクションメール標準同梱', description: 'APIキー1本で注文確認・パスワードリセットをそのまま送信。Mandrill追加料金不要。' },
  { icon: Shield, title: 'SPF / DKIM / DMARC 認証', description: 'ガイド付きウィザードで送信ドメインを認証。認証なしドメインからの送信はブロック。' },
  { icon: BarChart3, title: '詳細な配信統計', description: '開封率・クリック率・バウンス率をリアルタイム集計。リンク別クリックも追跡。' },
  { icon: Globe, title: 'セルフホスト版をOSS公開', description: 'Vercel + Supabase構成で5分デプロイ。データを自社サーバーで完全管理。' },
  { icon: CheckCircle, title: '重複連絡先を一意管理', description: 'メールアドレスをUNIQUEキーとし、複数リストに所属しても1件としてカウント。' },
]

const pricing = [
  { name: 'Free', price: '¥0', period: '/ 月', description: '小規模スタートに最適', limit: '月5万通・1万連絡先', features: ['1万連絡先まで', '月5万通', 'オートメーション（3ワークフロー）', 'APIキー1本', 'コミュニティサポート'], cta: '無料で始める', href: '/register', highlighted: false },
  { name: 'Starter', price: '¥1,980', period: '/ 月', description: '成長フェーズのビジネスに', limit: '月10万通', features: ['無制限連絡先', '月10万通', 'オートメーション（無制限）', 'APIキー10本', 'SPF/DKIM認証', 'メールサポート'], cta: '14日間無料で試す', href: '/register?plan=starter', highlighted: true },
  { name: 'Business', price: '¥4,980', period: '/ 月', description: '大量配信・チーム運用向け', limit: '月50万通', features: ['無制限連絡先', '月50万通', 'チームメンバー無制限', 'A/Bテスト', '優先サポート', 'カスタムドメイン'], cta: '14日間無料で試す', href: '/register?plan=business', highlighted: false },
]

const comparison = [
  { feature: '無料プランの連絡先上限', mailchimp: '250件', ours: '1万件' },
  { feature: '月次送信数（無料）', mailchimp: '500通', ours: '5万通' },
  { feature: '料金モデル', mailchimp: '連絡先数', ours: '送信数' },
  { feature: 'トランザクションメール', mailchimp: '別料金（Mandrill）', ours: '標準同梱' },
  { feature: 'セルフホスト', mailchimp: '不可', ours: 'OSSで公開' },
  { feature: '重複連絡先の二重課金', mailchimp: 'あり', ours: 'なし' },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gray-900 rounded flex items-center justify-center">
              <Mail className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-900">MailFlow</span>
            <span className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded ml-1">OSS</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="#features" className="text-sm text-gray-500 hover:text-gray-900 hidden md:block">機能</a>
            <a href="#pricing" className="text-sm text-gray-500 hover:text-gray-900 hidden md:block">料金</a>
            <a href="https://github.com/postcabinets-jp/email-marketing" className="text-sm text-gray-500 hover:text-gray-900 hidden md:block" target="_blank" rel="noopener noreferrer">GitHub</a>
            <Link href="/login" className="text-sm text-gray-500 hover:text-gray-900">ログイン</Link>
            <Link href="/register" className="text-sm bg-gray-900 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors">無料で始める</Link>
          </div>
        </div>
      </nav>

      <section className="pt-32 pb-20 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 text-xs font-medium px-3 py-1.5 rounded-full mb-6 border border-emerald-200">
            <CheckCircle className="w-3.5 h-3.5" />
            Mailchimpの代替 — 無料プランで1万件対応
          </div>
          <h1 className="text-5xl sm:text-6xl font-extrabold text-gray-900 tracking-tight leading-tight mb-6">
            メールマーケティングを<br />
            <span className="text-gray-500">送信数で課金する</span>
          </h1>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-8 leading-relaxed">
            Mailchimpは2021年のIntuit買収後、料金を30%値上げし無料プランを250件に縮小した。<br />
            MailFlowは連絡先数ではなく送信数で課金。1万件まで無料で、トランザクションメールも標準同梱。
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/register" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-lg text-sm font-semibold hover:bg-gray-700 transition-colors">
              無料で始める
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
            </Link>
            <a href="https://vercel.com/new/clone?repository-url=https://github.com/postcabinets-jp/email-marketing" target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 border border-gray-300 text-gray-700 px-6 py-3 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
              <svg className="w-4 h-4" viewBox="0 0 76 76" fill="none"><path d="M37.5274 0L75.0548 65H0L37.5274 0Z" fill="black"/></svg>
              Vercel でデプロイ
            </a>
          </div>
          <p className="text-xs text-gray-400 mt-4">クレジットカード不要 · 1万件まで永続無料</p>
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">Mailchimp との比較</h2>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left px-5 py-3 font-medium text-gray-600">比較項目</th>
                  <th className="text-center px-5 py-3 font-medium text-gray-400">Mailchimp</th>
                  <th className="text-center px-5 py-3 font-medium text-gray-900">MailFlow</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {comparison.map(({ feature, mailchimp, ours }) => (
                  <tr key={feature}>
                    <td className="px-5 py-3 text-gray-700">{feature}</td>
                    <td className="px-5 py-3 text-center text-gray-400">{mailchimp}</td>
                    <td className="px-5 py-3 text-center font-semibold text-emerald-700">{ours}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section id="features" className="py-20 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">必要な機能がすべて揃っている</h2>
            <p className="text-gray-500">Mailchimpの痛点を解決するために設計された機能セット</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map(({ icon: Icon, title, description }) => (
              <div key={title} className="bg-white rounded-xl border border-gray-200 p-5 hover:border-gray-400 transition-colors">
                <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-gray-700" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1.5">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="py-20 px-4 sm:px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">シンプルな送信数課金</h2>
            <p className="text-gray-500">リストが大きくなっても自動値上げなし。使った分だけ払う。</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {pricing.map(plan => (
              <div key={plan.name} className={`rounded-xl border p-6 flex flex-col ${plan.highlighted ? 'bg-gray-900 border-gray-900 text-white' : 'bg-white border-gray-200'}`}>
                <div className="mb-5">
                  <h3 className={`font-bold text-lg ${plan.highlighted ? 'text-white' : 'text-gray-900'}`}>{plan.name}</h3>
                  <p className={`text-xs mt-0.5 ${plan.highlighted ? 'text-gray-400' : 'text-gray-500'}`}>{plan.description}</p>
                  <div className="flex items-baseline gap-1 mt-3">
                    <span className={`text-4xl font-extrabold ${plan.highlighted ? 'text-white' : 'text-gray-900'}`}>{plan.price}</span>
                    <span className={`text-sm ${plan.highlighted ? 'text-gray-400' : 'text-gray-500'}`}>{plan.period}</span>
                  </div>
                  <p className={`text-xs mt-1 ${plan.highlighted ? 'text-emerald-400' : 'text-emerald-600'}`}>{plan.limit}</p>
                </div>
                <ul className="space-y-2 mb-6 flex-1">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <CheckCircle className={`w-4 h-4 shrink-0 ${plan.highlighted ? 'text-emerald-400' : 'text-emerald-500'}`} />
                      <span className={plan.highlighted ? 'text-gray-300' : 'text-gray-600'}>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link href={plan.href} className={`text-center py-2.5 px-4 rounded-lg text-sm font-semibold transition-colors ${plan.highlighted ? 'bg-white text-gray-900 hover:bg-gray-100' : 'bg-gray-900 text-white hover:bg-gray-700'}`}>
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4 sm:px-6 border-t border-gray-200">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">セルフホストで完全なデータ管理</h2>
          <p className="text-gray-500 mb-8 leading-relaxed">全コードをGitHubで公開。Vercel + Supabaseで5分デプロイ。<br />メールリストを自社サーバーで管理したいビジネスへ。</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a href="https://vercel.com/new/clone?repository-url=https://github.com/postcabinets-jp/email-marketing&env=NEXT_PUBLIC_SUPABASE_URL,NEXT_PUBLIC_SUPABASE_ANON_KEY,SUPABASE_SERVICE_ROLE_KEY" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-black text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors">
              <svg className="w-4 h-4" viewBox="0 0 76 76" fill="none"><path d="M37.5274 0L75.0548 65H0L37.5274 0Z" fill="white"/></svg>
              Deploy with Vercel
            </a>
            <a href="https://github.com/postcabinets-jp/email-marketing" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 border border-gray-300 text-gray-700 px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/></svg>
              View on GitHub
            </a>
          </div>
        </div>
      </section>

      <footer className="py-10 px-4 sm:px-6 border-t border-gray-200">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gray-900 rounded flex items-center justify-center">
              <Mail className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-sm font-semibold text-gray-900">MailFlow</span>
            <span className="text-xs text-gray-400 ml-2">MIT License</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-gray-400">
            <a href="https://github.com/postcabinets-jp/email-marketing" className="hover:text-gray-600 transition-colors" target="_blank" rel="noopener noreferrer">GitHub</a>
            <Link href="/docs/api" className="hover:text-gray-600 transition-colors">API Docs</Link>
            <span>Built by <a href="https://postcabinets.co.jp" className="hover:text-gray-600 transition-colors">POST CABINETS</a></span>
          </div>
        </div>
      </footer>
    </div>
  )
}
