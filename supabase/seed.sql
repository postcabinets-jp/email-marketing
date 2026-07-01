-- ============================================================
-- Seed data — realistic demo content
-- ============================================================
-- NOTE: auth.users rows must be created through Supabase Auth Admin API
-- in production. This seed inserts directly for local dev only.

-- Demo organization
INSERT INTO organizations (id, name, slug, plan, monthly_send_limit, sends_this_month)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'Haruki Coffee Roasters', 'haruki-coffee', 'starter', 100000, 18420),
  ('22222222-2222-2222-2222-222222222222', 'Shibuya Skincare Co.', 'shibuya-skincare', 'business', 500000, 87340);

-- Demo tags
INSERT INTO tags (id, organization_id, name, color) VALUES
  ('aaaa0001-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'vip', '#16a34a'),
  ('aaaa0001-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', 'wholesale', '#2563eb'),
  ('aaaa0001-0000-0000-0000-000000000003', '11111111-1111-1111-1111-111111111111', 'newsletter', '#9333ea'),
  ('aaaa0001-0000-0000-0000-000000000004', '11111111-1111-1111-1111-111111111111', 'cafe-owner', '#ea580c');

-- Demo contacts
INSERT INTO contacts (id, organization_id, email, first_name, last_name, status, source, custom_fields) VALUES
  ('bbbb0001-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'yuki.tanaka@gmail.com', '由紀', '田中', 'subscribed', 'form', '{"city": "Tokyo", "loyalty_tier": "gold"}'),
  ('bbbb0001-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', 'kenji.mori@cafe-sakura.jp', '健二', '森', 'subscribed', 'import', '{"city": "Osaka", "business_type": "cafe", "annual_order_kg": 120}'),
  ('bbbb0001-0000-0000-0000-000000000003', '11111111-1111-1111-1111-111111111111', 'sarah.chen@bluewave.co', 'Sarah', 'Chen', 'subscribed', 'api', '{"city": "Kyoto", "business_type": "restaurant"}'),
  ('bbbb0001-0000-0000-0000-000000000004', '11111111-1111-1111-1111-111111111111', 'takeru.ito@hotmail.com', '猛', '伊藤', 'subscribed', 'form', '{"city": "Nagoya"}'),
  ('bbbb0001-0000-0000-0000-000000000005', '11111111-1111-1111-1111-111111111111', 'mei.yamamoto@outlook.jp', '明', '山本', 'subscribed', 'form', '{"city": "Fukuoka"}'),
  ('bbbb0001-0000-0000-0000-000000000006', '11111111-1111-1111-1111-111111111111', 'david.kim@globalbrands.io', 'David', 'Kim', 'subscribed', 'import', '{"city": "Tokyo", "business_type": "distributor", "annual_order_kg": 800}'),
  ('bbbb0001-0000-0000-0000-000000000007', '11111111-1111-1111-1111-111111111111', 'akiko.sato@gmail.com', '明子', '佐藤', 'unsubscribed', 'form', '{"city": "Sapporo"}'),
  ('bbbb0001-0000-0000-0000-000000000008', '11111111-1111-1111-1111-111111111111', 'park.jihoon@k-roasters.kr', 'Jihoon', 'Park', 'subscribed', 'api', '{"city": "Seoul", "business_type": "roastery"}'),
  ('bbbb0001-0000-0000-0000-000000000009', '11111111-1111-1111-1111-111111111111', 'nadia.volkov@brunch-co.ru', 'Nadia', 'Volkov', 'subscribed', 'import', '{"city": "Moscow"}'),
  ('bbbb0001-0000-0000-0000-000000000010', '11111111-1111-1111-1111-111111111111', 'haruto.nakamura@bean.jp', '悠人', '中村', 'bounced', 'form', '{"city": "Hiroshima"}');

-- Tag assignments
INSERT INTO contact_tags (contact_id, tag_id) VALUES
  ('bbbb0001-0000-0000-0000-000000000001', 'aaaa0001-0000-0000-0000-000000000001'),
  ('bbbb0001-0000-0000-0000-000000000001', 'aaaa0001-0000-0000-0000-000000000003'),
  ('bbbb0001-0000-0000-0000-000000000002', 'aaaa0001-0000-0000-0000-000000000002'),
  ('bbbb0001-0000-0000-0000-000000000002', 'aaaa0001-0000-0000-0000-000000000004'),
  ('bbbb0001-0000-0000-0000-000000000003', 'aaaa0001-0000-0000-0000-000000000002'),
  ('bbbb0001-0000-0000-0000-000000000004', 'aaaa0001-0000-0000-0000-000000000003'),
  ('bbbb0001-0000-0000-0000-000000000005', 'aaaa0001-0000-0000-0000-000000000003'),
  ('bbbb0001-0000-0000-0000-000000000006', 'aaaa0001-0000-0000-0000-000000000001'),
  ('bbbb0001-0000-0000-0000-000000000006', 'aaaa0001-0000-0000-0000-000000000002'),
  ('bbbb0001-0000-0000-0000-000000000008', 'aaaa0001-0000-0000-0000-000000000002'),
  ('bbbb0001-0000-0000-0000-000000000009', 'aaaa0001-0000-0000-0000-000000000003');

-- Demo mailing lists
INSERT INTO lists (id, organization_id, name, description, double_optin, from_name, from_email, subscriber_count) VALUES
  ('cccc0001-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'Monthly Newsletter', '月次コーヒー通信。新入荷・豆の産地・抽出レシピを配信。', false, 'Haruki Coffee Roasters', 'hello@haruki-coffee.jp', 8),
  ('cccc0001-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', 'Wholesale Buyers', '法人・業務用バイヤー向け。新ロット・価格改定・サンプル案内。', true, 'Haruki B2B Team', 'wholesale@haruki-coffee.jp', 4),
  ('cccc0001-0000-0000-0000-000000000003', '11111111-1111-1111-1111-111111111111', 'VIP Early Access', '限定ロット先行購入のお知らせ。VIP顧客のみ。', true, 'Haruki Coffee VIP', 'vip@haruki-coffee.jp', 2);

-- List memberships
INSERT INTO list_contacts (list_id, contact_id, status) VALUES
  ('cccc0001-0000-0000-0000-000000000001', 'bbbb0001-0000-0000-0000-000000000001', 'subscribed'),
  ('cccc0001-0000-0000-0000-000000000001', 'bbbb0001-0000-0000-0000-000000000004', 'subscribed'),
  ('cccc0001-0000-0000-0000-000000000001', 'bbbb0001-0000-0000-0000-000000000005', 'subscribed'),
  ('cccc0001-0000-0000-0000-000000000001', 'bbbb0001-0000-0000-0000-000000000008', 'subscribed'),
  ('cccc0001-0000-0000-0000-000000000001', 'bbbb0001-0000-0000-0000-000000000009', 'subscribed'),
  ('cccc0001-0000-0000-0000-000000000001', 'bbbb0001-0000-0000-0000-000000000002', 'subscribed'),
  ('cccc0001-0000-0000-0000-000000000001', 'bbbb0001-0000-0000-0000-000000000003', 'subscribed'),
  ('cccc0001-0000-0000-0000-000000000001', 'bbbb0001-0000-0000-0000-000000000006', 'subscribed'),
  ('cccc0001-0000-0000-0000-000000000002', 'bbbb0001-0000-0000-0000-000000000002', 'subscribed'),
  ('cccc0001-0000-0000-0000-000000000002', 'bbbb0001-0000-0000-0000-000000000003', 'subscribed'),
  ('cccc0001-0000-0000-0000-000000000002', 'bbbb0001-0000-0000-0000-000000000006', 'subscribed'),
  ('cccc0001-0000-0000-0000-000000000002', 'bbbb0001-0000-0000-0000-000000000008', 'subscribed'),
  ('cccc0001-0000-0000-0000-000000000003', 'bbbb0001-0000-0000-0000-000000000001', 'subscribed'),
  ('cccc0001-0000-0000-0000-000000000003', 'bbbb0001-0000-0000-0000-000000000006', 'subscribed');

-- Demo segments
INSERT INTO segments (id, organization_id, name, conditions, match_type) VALUES
  ('dddd0001-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'VIP Buyers', '[{"field":"tag","op":"has","value":"vip"},{"field":"tag","op":"has","value":"wholesale"}]', 'all'),
  ('dddd0001-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', 'Tokyo & Osaka Subscribers', '[{"field":"custom_fields.city","op":"in","value":["Tokyo","Osaka"]}]', 'any'),
  ('dddd0001-0000-0000-0000-000000000003', '11111111-1111-1111-1111-111111111111', 'High-Volume Wholesale', '[{"field":"custom_fields.annual_order_kg","op":"gte","value":100}]', 'all');

-- Demo email templates
INSERT INTO email_templates (id, organization_id, name, subject, html_body, preview_text, is_global) VALUES
  (
    'eeee0001-0000-0000-0000-000000000001',
    '11111111-1111-1111-1111-111111111111',
    'Monthly Newsletter Template',
    '{{month}}号 | Haruki Coffee 通信',
    '<!DOCTYPE html><html><body style="font-family:''Helvetica Neue'',Arial,sans-serif;color:#1a1a1a;max-width:600px;margin:0 auto;padding:32px 16px"><h1 style="font-size:24px;font-weight:700;border-bottom:2px solid #1a1a1a;padding-bottom:12px">Haruki Coffee 月次通信</h1><p>こんにちは {{first_name}} さん、</p><p>今月の新着ロットと産地レポートをお届けします。</p><div style="background:#f5f5f0;padding:24px;border-radius:4px;margin:24px 0"><h2 style="font-size:18px;margin-top:0">今月の注目ロット</h2><p>{{featured_lot}}</p></div><p>引き続きよろしくお願いいたします。<br>Haruki Coffee Roasters</p><hr style="border:none;border-top:1px solid #e5e5e5;margin:32px 0"><p style="font-size:12px;color:#666">配信停止は<a href="{{unsubscribe_url}}">こちら</a></p></body></html>',
    '今月の新着ロットと産地レポート',
    false
  ),
  (
    'eeee0001-0000-0000-0000-000000000002',
    '11111111-1111-1111-1111-111111111111',
    'Welcome Email',
    'Haruki Coffee へようこそ',
    '<!DOCTYPE html><html><body style="font-family:''Helvetica Neue'',Arial,sans-serif;color:#1a1a1a;max-width:600px;margin:0 auto;padding:32px 16px"><h1 style="font-size:24px;font-weight:700">ご登録ありがとうございます</h1><p>{{first_name}} さん、こんにちは。</p><p>Haruki Coffee Roasters のニュースレターへようこそ。月に1回、厳選した豆の情報と抽出レシピをお届けします。</p><p>最初のご注文に使える <strong>10% 割引コード: WELCOME10</strong> をご利用ください。</p><p>今後ともよろしくお願いいたします。<br>Haruki Coffee チーム</p></body></html>',
    'Haruki Coffee Roasters のコミュニティへ',
    false
  );

-- Demo campaigns
INSERT INTO campaigns (id, organization_id, name, subject, from_name, from_email, html_body, list_id, status, sent_at, recipients_count, sent_count, open_count, click_count, bounce_count, unsubscribe_count) VALUES
  (
    'ffff0001-0000-0000-0000-000000000001',
    '11111111-1111-1111-1111-111111111111',
    '2026年6月号 Newsletter',
    '6月号 | エチオピア新ロット入荷のお知らせ',
    'Haruki Coffee Roasters',
    'hello@haruki-coffee.jp',
    '<!DOCTYPE html><html><body style="font-family:Helvetica Neue,Arial,sans-serif;color:#1a1a1a;max-width:600px;margin:0 auto;padding:32px 16px"><h1>エチオピア イルガチェフ G1 — 6月限定ロット</h1><p>2026年の最上質ロットが届きました。フローラルな香りとブライトな酸が特徴の、今年イチ押しの1本です。</p><p>在庫僅少のため、お早めにご注文ください。</p></body></html>',
    'cccc0001-0000-0000-0000-000000000001',
    'sent',
    '2026-06-15 09:00:00+09',
    8, 8, 5, 3, 0, 0
  ),
  (
    'ffff0001-0000-0000-0000-000000000002',
    '11111111-1111-1111-1111-111111111111',
    '卸バイヤー向け価格改定通知',
    '【重要】2026年7月以降の価格改定について',
    'Haruki B2B Team',
    'wholesale@haruki-coffee.jp',
    '<!DOCTYPE html><html><body style="font-family:Helvetica Neue,Arial,sans-serif;color:#1a1a1a;max-width:600px;margin:0 auto;padding:32px 16px"><h1>価格改定のご案内</h1><p>平素よりご愛顧いただきありがとうございます。2026年7月より、原材料・物流コスト上昇に伴い、一部商品の価格を改定させていただきます。詳細はPDFをご参照ください。</p></body></html>',
    'cccc0001-0000-0000-0000-000000000002',
    'sent',
    '2026-06-28 14:00:00+09',
    4, 4, 4, 2, 0, 0
  ),
  (
    'ffff0001-0000-0000-0000-000000000003',
    '11111111-1111-1111-1111-111111111111',
    '2026年7月号 Newsletter',
    '7月号 | コロンビア ウイラ農園 収穫レポート',
    'Haruki Coffee Roasters',
    'hello@haruki-coffee.jp',
    '',
    'cccc0001-0000-0000-0000-000000000001',
    'draft',
    NULL,
    0, 0, 0, 0, 0, 0
  );

-- Demo email events
INSERT INTO email_events (campaign_id, contact_id, event_type, metadata, occurred_at) VALUES
  ('ffff0001-0000-0000-0000-000000000001', 'bbbb0001-0000-0000-0000-000000000001', 'sent', '{}', '2026-06-15 09:00:01+09'),
  ('ffff0001-0000-0000-0000-000000000001', 'bbbb0001-0000-0000-0000-000000000001', 'delivered', '{}', '2026-06-15 09:00:05+09'),
  ('ffff0001-0000-0000-0000-000000000001', 'bbbb0001-0000-0000-0000-000000000001', 'opened', '{"user_agent":"Mozilla/5.0","ip":"203.0.113.10"}', '2026-06-15 10:32:00+09'),
  ('ffff0001-0000-0000-0000-000000000001', 'bbbb0001-0000-0000-0000-000000000001', 'clicked', '{"url":"https://haruki-coffee.jp/shop/ethiopia-g1"}', '2026-06-15 10:33:20+09'),
  ('ffff0001-0000-0000-0000-000000000001', 'bbbb0001-0000-0000-0000-000000000002', 'sent', '{}', '2026-06-15 09:00:01+09'),
  ('ffff0001-0000-0000-0000-000000000001', 'bbbb0001-0000-0000-0000-000000000002', 'delivered', '{}', '2026-06-15 09:00:06+09'),
  ('ffff0001-0000-0000-0000-000000000001', 'bbbb0001-0000-0000-0000-000000000002', 'opened', '{"user_agent":"Apple Mail","ip":"203.0.113.20"}', '2026-06-15 11:05:00+09'),
  ('ffff0001-0000-0000-0000-000000000001', 'bbbb0001-0000-0000-0000-000000000002', 'clicked', '{"url":"https://haruki-coffee.jp/shop/ethiopia-g1"}', '2026-06-15 11:06:10+09'),
  ('ffff0001-0000-0000-0000-000000000001', 'bbbb0001-0000-0000-0000-000000000003', 'sent', '{}', '2026-06-15 09:00:02+09'),
  ('ffff0001-0000-0000-0000-000000000001', 'bbbb0001-0000-0000-0000-000000000003', 'delivered', '{}', '2026-06-15 09:00:07+09'),
  ('ffff0001-0000-0000-0000-000000000001', 'bbbb0001-0000-0000-0000-000000000003', 'opened', '{"user_agent":"Outlook","ip":"203.0.113.30"}', '2026-06-15 14:22:00+09'),
  ('ffff0001-0000-0000-0000-000000000001', 'bbbb0001-0000-0000-0000-000000000004', 'sent', '{}', '2026-06-15 09:00:02+09'),
  ('ffff0001-0000-0000-0000-000000000001', 'bbbb0001-0000-0000-0000-000000000004', 'delivered', '{}', '2026-06-15 09:00:08+09'),
  ('ffff0001-0000-0000-0000-000000000001', 'bbbb0001-0000-0000-0000-000000000005', 'sent', '{}', '2026-06-15 09:00:02+09'),
  ('ffff0001-0000-0000-0000-000000000001', 'bbbb0001-0000-0000-0000-000000000005', 'delivered', '{}', '2026-06-15 09:00:09+09'),
  ('ffff0001-0000-0000-0000-000000000001', 'bbbb0001-0000-0000-0000-000000000005', 'opened', '{"user_agent":"Gmail","ip":"203.0.113.50"}', '2026-06-16 08:00:00+09'),
  ('ffff0001-0000-0000-0000-000000000001', 'bbbb0001-0000-0000-0000-000000000006', 'sent', '{}', '2026-06-15 09:00:03+09'),
  ('ffff0001-0000-0000-0000-000000000001', 'bbbb0001-0000-0000-0000-000000000006', 'delivered', '{}', '2026-06-15 09:00:10+09'),
  ('ffff0001-0000-0000-0000-000000000001', 'bbbb0001-0000-0000-0000-000000000006', 'clicked', '{"url":"https://haruki-coffee.jp/wholesale/ethiopia-bulk"}', '2026-06-15 09:45:00+09');

-- Demo workflows
INSERT INTO workflows (id, organization_id, name, trigger_type, trigger_config, status, enrolled_count) VALUES
  (
    'gggg0001-0000-0000-0000-000000000001',
    '11111111-1111-1111-1111-111111111111',
    'Welcome Series — Newsletter',
    'list_subscribe',
    '{"list_id": "cccc0001-0000-0000-0000-000000000001"}',
    'active',
    6
  ),
  (
    'gggg0001-0000-0000-0000-000000000002',
    '11111111-1111-1111-1111-111111111111',
    'VIP Onboarding',
    'tag_added',
    '{"tag_name": "vip"}',
    'active',
    2
  );

INSERT INTO workflow_steps (id, workflow_id, step_order, step_type, config) VALUES
  ('hhhh0001-0000-0000-0000-000000000001', 'gggg0001-0000-0000-0000-000000000001', 1, 'send_email', '{"template_id": "eeee0001-0000-0000-0000-000000000002", "subject": "Haruki Coffee へようこそ"}'),
  ('hhhh0001-0000-0000-0000-000000000002', 'gggg0001-0000-0000-0000-000000000001', 2, 'delay', '{"delay_value": 3, "delay_unit": "days"}'),
  ('hhhh0001-0000-0000-0000-000000000003', 'gggg0001-0000-0000-0000-000000000001', 3, 'send_email', '{"template_id": "eeee0001-0000-0000-0000-000000000001", "subject": "おすすめの抽出レシピ3選"}'),
  ('hhhh0001-0000-0000-0000-000000000004', 'gggg0001-0000-0000-0000-000000000002', 1, 'send_email', '{"template_id": "eeee0001-0000-0000-0000-000000000002", "subject": "VIP会員特典のご案内"}'),
  ('hhhh0001-0000-0000-0000-000000000005', 'gggg0001-0000-0000-0000-000000000002', 2, 'add_tag', '{"tag_name": "newsletter"}');

-- Demo sending domain
INSERT INTO sending_domains (id, organization_id, domain, dkim_status, spf_status, dmarc_status, dkim_selector, verified_at) VALUES
  ('iiii0001-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'haruki-coffee.jp', 'verified', 'verified', 'verified', 'mail', '2026-05-01 10:00:00+09');

-- Demo subscription form
INSERT INTO subscription_forms (id, organization_id, list_id, name, fields, success_message) VALUES
  ('jjjj0001-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'cccc0001-0000-0000-0000-000000000001', 'Website Newsletter Form', '["email","first_name","last_name"]', 'ご登録ありがとうございます！次号をお楽しみに。');
