'use client'

import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { deleteSegment } from '@/app/actions/segments'

export function DeleteSegmentButton({ id, name }: { id: string; name: string }) {
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    if (!confirm(`セグメント「${name}」を削除しますか？`)) return
    setDeleting(true)
    await deleteSegment(id)
    setDeleting(false)
  }

  return (
    <button
      onClick={handleDelete}
      disabled={deleting}
      className="text-gray-400 hover:text-red-600 transition-colors p-1 disabled:opacity-50 shrink-0"
      title="削除"
    >
      <Trash2 className="w-3.5 h-3.5" />
    </button>
  )
}
