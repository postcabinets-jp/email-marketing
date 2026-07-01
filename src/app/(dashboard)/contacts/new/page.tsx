'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function NewContactPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ email: '', first_name: '', last_name: '', phone: '' })

  function update(key: keyof typeof form, value: string) {
    setForm(f => ({ ...f, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: membership } = await supabase
      .from('memberships').select('organization_id').eq('user_id', user.id).limit(1).single()

    await supabase.from('contacts').insert({
      organization_id: membership?.organization_id,
      email: form.email,
      first_name: form.first_name || null,
      last_name: form.last_name || null,
      phone: form.phone || null,
      source: 'manual',
    })

    router.push('/contacts')
  }

  return (
    <div className="max-w-lg space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/contacts"><ArrowLeft className="w-4 h-4" /></Link>
        </Button>
        <h1 className="text-xl font-semibold text-gray-900">連絡先を追加</h1>
      </div>
      <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
        <div>
          <Label htmlFor="email">メールアドレス *</Label>
          <Input id="email" type="email" required value={form.email} onChange={e => update('email', e.target.value)} className="mt-1" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="first_name">名</Label>
            <Input id="first_name" value={form.first_name} onChange={e => update('first_name', e.target.value)} className="mt-1" />
          </div>
          <div>
            <Label htmlFor="last_name">姓</Label>
            <Input id="last_name" value={form.last_name} onChange={e => update('last_name', e.target.value)} className="mt-1" />
          </div>
        </div>
        <div>
          <Label htmlFor="phone">電話番号</Label>
          <Input id="phone" type="tel" value={form.phone} onChange={e => update('phone', e.target.value)} className="mt-1" />
        </div>
        <Button type="submit" disabled={saving}>{saving ? '保存中...' : '追加する'}</Button>
      </form>
    </div>
  )
}
