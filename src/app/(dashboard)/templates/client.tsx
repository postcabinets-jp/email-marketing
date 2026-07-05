'use client'

import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { deleteTemplate } from '@/app/actions/templates'

export function DeleteTemplateButton({ id, name }: { id: string; name: string }) {
  const [deleting, setDeleting] = useState(false)

  async function handleDelete(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (!confirm(`テンプレート「${name}」を削除しますか？`)) return
    setDeleting(true)
    await deleteTemplate(id)
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
