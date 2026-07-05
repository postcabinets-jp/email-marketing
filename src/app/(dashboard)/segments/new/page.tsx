'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Plus, Trash2 } from 'lucide-react'
import { createSegment } from '@/app/actions/segments'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

type Condition = { field: string; op: string; value: string }

const fieldOptions = [
  { value: 'tag', label: 'タグ' },
  { value: 'status', label: 'ステータス' },
  { value: 'custom_fields.city', label: '都市（カスタムフィールド）' },
  { value: 'custom_fields.annual_order_kg', label: '年間発注量（カスタムフィールド）' },
]

const opOptions = [
  { value: 'has', label: '含む' },
  { value: 'not_has', label: '含まない' },
  { value: 'eq', label: '等しい' },
  { value: 'gte', label: '以上' },
  { value: 'lte', label: '以下' },
  { value: 'in', label: 'いずれかに含まれる' },
]

export default function NewSegmentPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [matchType, setMatchType] = useState<'all' | 'any'>('all')
  const [conditions, setConditions] = useState<Condition[]>([{ field: 'tag', op: 'has', value: '' }])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function addCondition() {
    setConditions(c => [...c, { field: 'tag', op: 'has', value: '' }])
  }

  function removeCondition(i: number) {
    setConditions(c => c.filter((_, idx) => idx !== i))
  }

  function updateCondition(i: number, key: keyof Condition, value: string) {
    setConditions(c => c.map((cond, idx) => idx === i ? { ...cond, [key]: value } : cond))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    const result = await createSegment({ name, conditions, match_type: matchType })
    setSaving(false)
    if (result.success) {
      router.push('/segments')
    } else {
      setError(result.error)
    }
  }

  return (
    <div className="max-w-xl space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/segments"><ArrowLeft className="w-4 h-4" /></Link>
        </Button>
        <h1 className="text-xl font-semibold text-gray-900">新規セグメント</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-6 space-y-5">
        <div>
          <Label htmlFor="name">セグメント名 *</Label>
          <Input id="name" required value={name} onChange={e => setName(e.target.value)} className="mt-1" placeholder="VIP Buyers Tokyo" />
        </div>

        <div>
          <div className="flex items-center gap-3 mb-3">
            <Label>条件</Label>
            <Select value={matchType} onValueChange={v => setMatchType((v ?? 'all') as 'all' | 'any')}>
              <SelectTrigger className="w-32 h-7 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">すべて一致</SelectItem>
                <SelectItem value="any">いずれか一致</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            {conditions.map((c, i) => (
              <div key={i} className="flex items-center gap-2">
                <Select value={c.field} onValueChange={v => updateCondition(i, 'field', v ?? '')}>
                  <SelectTrigger className="flex-1 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {fieldOptions.map(f => <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={c.op} onValueChange={v => updateCondition(i, 'op', v ?? '')}>
                  <SelectTrigger className="w-32 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {opOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Input value={c.value} onChange={e => updateCondition(i, 'value', e.target.value)} placeholder="値" className="flex-1 text-xs h-9" />
                <Button type="button" variant="ghost" size="sm" onClick={() => removeCondition(i)} disabled={conditions.length === 1}>
                  <Trash2 className="w-3.5 h-3.5 text-gray-400" />
                </Button>
              </div>
            ))}
          </div>
          <Button type="button" variant="outline" size="sm" className="mt-2 gap-1" onClick={addCondition}>
            <Plus className="w-3.5 h-3.5" /> 条件を追加
          </Button>
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">{error}</p>
        )}

        <Button type="submit" disabled={saving}>{saving ? '作成中...' : 'セグメントを作成'}</Button>
      </form>
    </div>
  )
}
