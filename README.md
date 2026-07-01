# MailFlow — 送信数課金のメールマーケティングツール

Mailchimpの代替OSS。**無料プランで1万件対応・送信数課金・トランザクションメール標準同梱**。

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/postcabinets-jp/email-marketing&env=NEXT_PUBLIC_SUPABASE_URL,NEXT_PUBLIC_SUPABASE_ANON_KEY,SUPABASE_SERVICE_ROLE_KEY&envDescription=Supabase%20project%20credentials&envLink=https://supabase.com/dashboard)

## なぜ MailFlow か

Mailchimpは2021年のIntuit買収後、料金を30%値上げし無料プランを**250件**に縮小した。
MailFlowは連絡先数ではなく**送信数で課金**。1万件まで無料で、トランザクションメールも標準同梱。

| 比較項目 | Mailchimp | MailFlow |
|---|---|---|
| 無料プランの連絡先上限 | 250件 | **1万件** |
| 月次送信数（無料） | 500通 | **5万通** |
| 料金モデル | 連絡先数 | **送信数** |
| トランザクションメール | 別料金（Mandrill） | **標準同梱** |
| セルフホスト | 不可 | **OSSで公開** |
| 重複連絡先の二重課金 | あり | **なし** |

## 機能

- **連絡先管理** — CSVインポート・カスタムフィールド・タグ付け・重複排除
- **メーリングリスト** — 複数リスト・ダブルオプトイン・埋め込みフォーム生成
- **セグメンテーション** — タグ・フィールド・アクティビティによるダイナミックセグメント
- **メールエディタ** — HTMLエディタ・リアルタイムプレビュー・テンプレート保存
- **キャンペーン送信** — 即時送信・スケジュール送信・4ステップウィザード
- **オートメーション** — ドリップシーケンス（登録/タグ/日付/APIトリガー）・最大20ステップ
- **トランザクションメールAPI** — APIキー発行・Mustache変数・送信ログ
- **配信統計** — 開封率・クリック率・バウンス率・購読解除率
- **送信ドメイン認証** — SPF / DKIM / DMARC 認証ウィザード
- **マルチユーザー** — オーナー / 管理者 / 送信者の3ロール

## 料金

| プラン | 価格 | 送信数上限 |
|---|---|---|
| Free | 無料 | 月5万通・1万連絡先 |
| Starter | ¥1,980/月 | 月10万通 |
| Business | ¥4,980/月 | 月50万通 |

## クイックスタート

### 1. Vercel + Supabase でデプロイ（推奨）

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/postcabinets-jp/email-marketing&env=NEXT_PUBLIC_SUPABASE_URL,NEXT_PUBLIC_SUPABASE_ANON_KEY,SUPABASE_SERVICE_ROLE_KEY)

1. 上のボタンをクリック
2. GitHubアカウントで Vercel にログイン
3. [Supabase](https://supabase.com) でプロジェクト作成 → `supabase/migrations/` の SQL を実行
4. 環境変数 3 つを設定してデプロイ

### 2. ローカル開発

```bash
git clone https://github.com/postcabinets-jp/email-marketing
cd email-marketing

# 環境変数設定
cp .env.example .env.local
# .env.local に Supabase の認証情報を入力

npm install
npm run dev
```

### 3. Supabase スキーマ適用

Supabase Dashboard の SQL Editor で以下を実行:

1. `supabase/migrations/20260701000001_initial_schema.sql` — テーブル・RLS 定義
2. `supabase/seed.sql` — デモデータ（任意）

## 環境変数

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
```

## 技術スタック

| レイヤー | 技術 |
|---|---|
| フロントエンド | Next.js 15 (App Router) + TypeScript strict |
| スタイリング | Tailwind CSS v4 + shadcn/ui |
| データベース | Supabase (PostgreSQL) + RLS 全テーブル適用 |
| 認証 | Supabase Auth（パスワード + Google OAuth） |
| デプロイ | Vercel + Supabase |

## ライセンス

MIT License

---

Built by [POST CABINETS](https://postcabinets.co.jp)
