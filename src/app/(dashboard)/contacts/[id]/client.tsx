'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'
import { deleteContact, updateContact } from '@/app/actions/contacts'
import { Button } from '@/components/ui/button'

export function ContactActions({ contactId }: { contactId: string }) {
  const router = useRouter()
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    if (!confirm('この連絡先を削除しますか？関連データもすべて削除されます。')) return
    setDeleting(true)
    const result = await deleteContact(contactId)
    if (result.success) {
      router.push('/contacts')
    } else {
      alert(result.error)
      setDeleting(false)
    }
  }

  async function handleUnsubscribe() {
    if (!confirm('この連絡先を購読解除しますか？')) return
    const result = await updateContact(contactId, {
      status: 'unsubscribed',
    })
    if (!result.success) {
      alert(result.error)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm" onClick={handleUnsubscribe}>
        購読解除
      </Button>
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
    </div>
  )
}
