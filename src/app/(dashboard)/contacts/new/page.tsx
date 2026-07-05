'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { createContact } from '@/app/actions/contacts'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function NewContactPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(formData: FormData) {
    setSaving(true)
    setError(null)
    const result = await createContact(formData)
    setSaving(false)
    if (result.success) {
      router.push('/contacts')
    } else {
      setError(result.error)
    }
  }

  return (
    <div className="max-w-lg space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/contacts"><ArrowLeft className="w-4 h-4" /></Link>
        </Button>
        <h1 className="text-xl font-semibold text-gray-900">連絡先を追加</h1>
      </div>
      <form action={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
        <div>
          <Label htmlFor="email">メールアドレス *</Label>
          <Input id="email" name="email" type="email" required className="mt-1" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="first_name">名</Label>
            <Input id="first_name" name="first_name" className="mt-1" />
          </div>
          <div>
            <Label htmlFor="last_name">姓</Label>
            <Input id="last_name" name="last_name" className="mt-1" />
          </div>
        </div>
        <div>
          <Label htmlFor="phone">電話番号</Label>
          <Input id="phone" name="phone" type="tel" className="mt-1" />
        </div>
        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">{error}</p>
        )}
        <Button type="submit" disabled={saving}>{saving ? '保存中...' : '追加する'}</Button>
      </form>
    </div>
  )
}
