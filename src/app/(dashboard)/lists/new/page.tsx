'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

export default function NewListPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ name: '', description: '', from_name: '', from_email: '', double_optin: false })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: membership } = await supabase
      .from('memberships').select('organization_id').eq('user_id', user.id).limit(1).single()

    await supabase.from('lists').insert({
      organization_id: membership?.organization_id,
      name: form.name,
      description: form.description || null,
      from_name: form.from_name || null,
      from_email: form.from_email || null,
      double_optin: form.double_optin,
    })

    router.push('/lists')
  }

  return (
    <div className="max-w-lg space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/lists"><ArrowLeft className="w-4 h-4" /></Link>
        </Button>
        <h1 className="text-xl font-semibold text-gray-900">新規メーリングリスト</h1>
      </div>
      <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
        <div>
          <Label htmlFor="name">リスト名 *</Label>
          <Input id="name" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="mt-1" placeholder="Monthly Newsletter" />
        </div>
        <div>
          <Label htmlFor="description">説明</Label>
          <Textarea id="description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="mt-1" rows={3} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="from_name">差出人名</Label>
            <Input id="from_name" value={form.from_name} onChange={e => setForm(f => ({ ...f, from_name: e.target.value }))} className="mt-1" />
          </div>
          <div>
            <Label htmlFor="from_email">差出人メール</Label>
            <Input id="from_email" type="email" value={form.from_email} onChange={e => setForm(f => ({ ...f, from_email: e.target.value }))} className="mt-1" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <input type="checkbox" id="double_optin" checked={form.double_optin} onChange={e => setForm(f => ({ ...f, double_optin: e.target.checked }))} className="rounded" />
          <Label htmlFor="double_optin">ダブルオプトインを有効にする</Label>
        </div>
        <Button type="submit" disabled={saving}>{saving ? '作成中...' : 'リストを作成'}</Button>
      </form>
    </div>
  )
}
