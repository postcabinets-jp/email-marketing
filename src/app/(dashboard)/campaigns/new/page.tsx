'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { createClient } from '@/lib/supabase/client'

const steps = ['受信者選択', '件名・差出人', 'メール本文', '確認・送信']

export default function NewCampaignPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: '',
    listId: '',
    subject: '',
    previewText: '',
    fromName: '',
    fromEmail: '',
    htmlBody: '',
  })

  function update(key: keyof typeof form, value: string) {
    setForm(f => ({ ...f, [key]: value }))
  }

  async function handleSaveDraft() {
    setSaving(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: membership } = await supabase
      .from('memberships')
      .select('organization_id')
      .eq('user_id', user.id)
      .limit(1)
      .single()

    const { data, error } = await supabase.from('campaigns').insert({
      organization_id: membership?.organization_id,
      name: form.name || '無題のキャンペーン',
      subject: form.subject || '(件名未設定)',
      preview_text: form.previewText,
      from_name: form.fromName,
      from_email: form.fromEmail,
      html_body: form.htmlBody,
      list_id: form.listId || null,
      status: 'draft',
    }).select('id').single()

    setSaving(false)
    if (!error && data) {
      router.push(`/campaigns/${data.id}`)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">新規キャンペーン作成</h1>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-0">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center">
            <button
              onClick={() => i < step && setStep(i)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                i === step ? 'bg-gray-900 text-white' : i < step ? 'bg-gray-100 text-gray-700 cursor-pointer hover:bg-gray-200' : 'bg-gray-50 text-gray-400 cursor-default'
              }`}
            >
              <span className={`w-4 h-4 rounded-full text-xs flex items-center justify-center font-bold ${i === step ? 'bg-white text-gray-900' : i < step ? 'bg-gray-400 text-white' : 'bg-gray-200 text-gray-500'}`}>
                {i < step ? '✓' : i + 1}
              </span>
              {s}
            </button>
            {i < steps.length - 1 && <div className="w-6 h-px bg-gray-300 mx-1" />}
          </div>
        ))}
      </div>

      {/* Step 0: Recipient selection */}
      {step === 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
          <h2 className="font-medium text-gray-900">キャンペーン名と受信者</h2>
          <div>
            <Label htmlFor="name">キャンペーン名（内部管理用）</Label>
            <Input id="name" value={form.name} onChange={e => update('name', e.target.value)} placeholder="2026年7月号 Newsletter" className="mt-1" />
          </div>
          <div>
            <Label>受信者リスト</Label>
            <p className="text-xs text-gray-400 mt-1 mb-2">リストIDを手動入力（UIリスト選択は次フェーズで実装）</p>
            <Input value={form.listId} onChange={e => update('listId', e.target.value)} placeholder="list UUID" className="mt-1" />
          </div>
          <Button onClick={() => setStep(1)} disabled={!form.name}>次へ</Button>
        </div>
      )}

      {/* Step 1: Subject + from */}
      {step === 1 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
          <h2 className="font-medium text-gray-900">件名・差出人設定</h2>
          <div>
            <Label htmlFor="subject">件名</Label>
            <Input id="subject" value={form.subject} onChange={e => update('subject', e.target.value)} placeholder="7月号 | コロンビア ウイラ農園 収穫レポート" className="mt-1" />
          </div>
          <div>
            <Label htmlFor="previewText">プレビューテキスト（任意）</Label>
            <Input id="previewText" value={form.previewText} onChange={e => update('previewText', e.target.value)} placeholder="受信トレイで件名の次に表示されるテキスト" className="mt-1" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="fromName">差出人名</Label>
              <Input id="fromName" value={form.fromName} onChange={e => update('fromName', e.target.value)} placeholder="Haruki Coffee Roasters" className="mt-1" />
            </div>
            <div>
              <Label htmlFor="fromEmail">差出人メールアドレス</Label>
              <Input id="fromEmail" type="email" value={form.fromEmail} onChange={e => update('fromEmail', e.target.value)} placeholder="hello@haruki-coffee.jp" className="mt-1" />
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setStep(0)}>戻る</Button>
            <Button onClick={() => setStep(2)} disabled={!form.subject || !form.fromEmail}>次へ</Button>
          </div>
        </div>
      )}

      {/* Step 2: HTML body */}
      {step === 2 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
          <h2 className="font-medium text-gray-900">メール本文（HTML）</h2>
          <p className="text-xs text-gray-400">フルエディタは <a href="/editor/new" className="text-blue-600 hover:underline">エディタページ</a> で利用できます。ここでは直接HTMLを入力できます。</p>
          <Textarea
            value={form.htmlBody}
            onChange={e => update('htmlBody', e.target.value)}
            placeholder="<!DOCTYPE html><html>..."
            className="font-mono text-xs h-64"
          />
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setStep(1)}>戻る</Button>
            <Button onClick={() => setStep(3)}>次へ</Button>
          </div>
        </div>
      )}

      {/* Step 3: Review */}
      {step === 3 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
          <h2 className="font-medium text-gray-900">確認</h2>
          <dl className="space-y-3 text-sm">
            {[
              ['キャンペーン名', form.name],
              ['件名', form.subject],
              ['差出人', `${form.fromName} <${form.fromEmail}>`],
              ['プレビューテキスト', form.previewText || '—'],
            ].map(([k, v]) => (
              <div key={k} className="flex gap-4">
                <dt className="w-36 text-gray-500 shrink-0">{k}</dt>
                <dd className="text-gray-900">{v}</dd>
              </div>
            ))}
          </dl>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setStep(2)}>戻る</Button>
            <Button onClick={handleSaveDraft} disabled={saving}>
              {saving ? '保存中...' : '下書きとして保存'}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
