'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'
import { addSendingDomain, deleteSendingDomain } from '@/app/actions/settings'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function AddDomainForm() {
  const router = useRouter()
  const [domain, setDomain] = useState('')
  const [adding, setAdding] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleAdd() {
    if (!domain) return
    setAdding(true)
    setError(null)
    const result = await addSendingDomain(domain)
    setAdding(false)
    if (result.success) {
      setDomain('')
      router.refresh()
    } else {
      setError(result.error)
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Input
          value={domain}
          onChange={e => setDomain(e.target.value)}
          placeholder="example.com"
          className="max-w-xs"
        />
        <Button size="sm" onClick={handleAdd} disabled={adding || !domain}>
          {adding ? '追加中...' : 'ドメインを追加'}
        </Button>
      </div>
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  )
}

export function DeleteDomainButton({ id, domain }: { id: string; domain: string }) {
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    if (!confirm(`ドメイン「${domain}」を削除しますか？`)) return
    setDeleting(true)
    await deleteSendingDomain(id)
    setDeleting(false)
  }

  return (
    <button
      onClick={handleDelete}
      disabled={deleting}
      className="text-xs text-red-600 hover:underline disabled:opacity-50"
    >
      {deleting ? '削除中...' : '削除'}
    </button>
  )
}
