'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2 } from 'lucide-react'
import { createApiKey, deleteApiKey } from '@/app/actions/settings'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function CreateApiKeyButton() {
  const router = useRouter()
  const [creating, setCreating] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [newKey, setNewKey] = useState<string | null>(null)

  async function handleCreate() {
    if (!name) return
    setCreating(true)
    const result = await createApiKey(name)
    setCreating(false)
    if (result.success) {
      setNewKey(result.data.key)
      setName('')
      router.refresh()
    }
  }

  if (newKey) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 space-y-2">
        <p className="text-sm font-medium text-emerald-800">APIキーが作成されました。この値をコピーしてください（再表示されません）:</p>
        <code className="block bg-white border border-emerald-200 rounded px-3 py-2 text-xs font-mono text-gray-900 select-all break-all">{newKey}</code>
        <Button size="sm" variant="outline" onClick={() => { setNewKey(null); setShowForm(false) }}>閉じる</Button>
      </div>
    )
  }

  if (showForm) {
    return (
      <div className="flex items-center gap-2">
        <Input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="キー名（例: Production API）"
          className="max-w-xs"
          autoFocus
        />
        <Button size="sm" onClick={handleCreate} disabled={creating || !name}>
          {creating ? '作成中...' : '作成'}
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setShowForm(false)}>キャンセル</Button>
      </div>
    )
  }

  return (
    <Button size="sm" className="gap-1.5" onClick={() => setShowForm(true)}>
      <Plus className="w-3.5 h-3.5" /> 新規発行
    </Button>
  )
}

export function DeleteApiKeyButton({ id, name }: { id: string; name: string }) {
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    if (!confirm(`APIキー「${name}」を削除しますか？`)) return
    setDeleting(true)
    await deleteApiKey(id)
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
