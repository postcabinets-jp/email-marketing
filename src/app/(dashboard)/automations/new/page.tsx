'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
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
]

export default function NewAutomationPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [name, setName] = useState('')
  const [triggerType, setTriggerType] = useState('list_subscribe')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: membership } = await supabase
      .from('memberships').select('organization_id').eq('user_id', user.id).limit(1).single()

    const { data } = await supabase.from('workflows').insert({
      organization_id: membership?.organization_id,
      name,
      trigger_type: triggerType,
      status: 'draft',
    }).select('id').single()

    router.push(data ? `/automations/${data.id}` : '/automations')
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
          <Select value={triggerType} onValueChange={(v) => setTriggerType(v ?? 'list_subscribe')}>
            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
            <SelectContent>
              {triggerTypes.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <Button type="submit" disabled={saving}>{saving ? '作成中...' : 'ワークフローを作成'}</Button>
      </form>
    </div>
  )
}
