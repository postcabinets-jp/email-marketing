'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2, X } from 'lucide-react'
import { deleteList, removeContactFromList } from '@/app/actions/lists'
import { Button } from '@/components/ui/button'

export function ListActions({ listId, listName }: { listId: string; listName: string }) {
  const router = useRouter()
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    if (!confirm(`リスト「${listName}」を削除しますか？購読者の連絡先データは残ります。`)) return
    setDeleting(true)
    const result = await deleteList(listId)
    if (result.success) {
      router.push('/lists')
    } else {
      alert(result.error)
      setDeleting(false)
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleDelete}
      disabled={deleting}
      className="text-red-600 hover:text-red-700 hover:bg-red-50"
    >
      <Trash2 className="w-3.5 h-3.5 mr-1" />
      {deleting ? '削除中...' : '削除'}
    </Button>
  )
}

export function RemoveContactButton({ listId, contactId, email }: { listId: string; contactId: string; email: string }) {
  const [removing, setRemoving] = useState(false)

  async function handleRemove() {
    if (!confirm(`${email} をこのリストから削除しますか？`)) return
    setRemoving(true)
    await removeContactFromList(listId, contactId)
    setRemoving(false)
  }

  return (
    <button
      onClick={handleRemove}
      disabled={removing}
      className="text-gray-400 hover:text-red-600 transition-colors p-1 disabled:opacity-50"
      title="リストから削除"
    >
      <X className="w-3.5 h-3.5" />
    </button>
  )
}
