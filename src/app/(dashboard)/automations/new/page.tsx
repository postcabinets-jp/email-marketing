'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { createWorkflow } from '@/app/actions/workflows'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const triggerTypes = [
  { value: 'list_subscribe', label: 'リスト登録時' },
  { value: 'tag_added', label: 'タグ追加時' },
  { value: 'date_field', label: '日付フィールド到達時' },
  { value: 'api_trigger', label: 'APIトリガー' },
  { value: 'link_click', label: 'リンククリック時' },
] as const

type TriggerType = typeof triggerTypes[number]['value']

export default function NewAutomationPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [triggerType, setTriggerType] = useState<TriggerType>('list_subscribe')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    const result = await createWorkflow({ name, trigger_type: triggerType })
    setSaving(false)
    if (result.success) {
      router.push(`/automations/${result.data.id}`)
    } else {
      setError(result.error)
    }
  }

  return (
    <div className="max-w-lg space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/automations"><ArrowLeft className="w-4 h-4" /></Link>
        </Button>
        <h1 className="text-xl font-semibold text-gray-900">新規ワークフロー</h1>
      </div>
      <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
        <div>
          <Label htmlFor="name">ワークフロー名 *</Label>
          <Input id="name" required value={name} onChange={e => setName(e.target.value)} className="mt-1" placeholder="Welcome Series" />
        </div>
        <div>
          <Label>トリガータイプ</Label>
          <Select value={triggerType} onValueChange={(v) => setTriggerType((v ?? 'list_subscribe') as TriggerType)}>
            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
            <SelectContent>
              {triggerTypes.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">{error}</p>
        )}
        <Button type="submit" disabled={saving}>{saving ? '作成中...' : 'ワークフローを作成'}</Button>
      </form>
    </div>
  )
}
