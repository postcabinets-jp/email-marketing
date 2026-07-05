'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { createList } from '@/app/actions/lists'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

export default function NewListPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(formData: FormData) {
    setSaving(true)
    setError(null)
    const result = await createList(formData)
    setSaving(false)
    if (result.success) {
      router.push('/lists')
    } else {
      setError(result.error)
    }
  }

  return (
    <div className="max-w-lg space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/lists"><ArrowLeft className="w-4 h-4" /></Link>
        </Button>
        <h1 className="text-xl font-semibold text-gray-900">新規メーリングリスト</h1>
      </div>
      <form action={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
        <div>
          <Label htmlFor="name">リスト名 *</Label>
          <Input id="name" name="name" required className="mt-1" placeholder="Monthly Newsletter" />
        </div>
        <div>
          <Label htmlFor="description">説明</Label>
          <Textarea id="description" name="description" className="mt-1" rows={3} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="from_name">差出人名</Label>
            <Input id="from_name" name="from_name" className="mt-1" />
          </div>
          <div>
            <Label htmlFor="from_email">差出人メール</Label>
            <Input id="from_email" name="from_email" type="email" className="mt-1" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <input type="hidden" name="double_optin" value="false" />
          <input type="checkbox" id="double_optin" name="double_optin" value="true" className="rounded" />
          <Label htmlFor="double_optin">ダブルオプトインを有効にする</Label>
        </div>
        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">{error}</p>
        )}
        <Button type="submit" disabled={saving}>{saving ? '作成中...' : 'リストを作成'}</Button>
      </form>
    </div>
  )
}
