'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2, Upload } from 'lucide-react'
import { deleteContact, importContacts } from '@/app/actions/contacts'
import { Button } from '@/components/ui/button'

export function DeleteContactButton({ id, email }: { id: string; email: string }) {
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    if (!confirm(`${email} を削除しますか？`)) return
    setDeleting(true)
    await deleteContact(id)
    setDeleting(false)
  }

  return (
    <button
      onClick={handleDelete}
      disabled={deleting}
      className="text-gray-400 hover:text-red-600 transition-colors p-1 disabled:opacity-50"
      title="削除"
    >
      <Trash2 className="w-3.5 h-3.5" />
    </button>
  )
}

export function ImportContactsButton() {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const [importing, setImporting] = useState(false)

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setImporting(true)
    const text = await file.text()
    const lines = text.split('\n').filter(Boolean)
    if (lines.length < 2) {
      alert('CSVファイルにデータがありません')
      setImporting(false)
      return
    }

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/"/g, ''))
    const emailIdx = headers.findIndex(h => h === 'email' || h === 'メールアドレス' || h === 'mail')
    if (emailIdx === -1) {
      alert('CSVに email 列が見つかりません')
      setImporting(false)
      return
    }

    const firstNameIdx = headers.findIndex(h => h === 'first_name' || h === '名' || h === 'firstname')
    const lastNameIdx = headers.findIndex(h => h === 'last_name' || h === '姓' || h === 'lastname')
    const phoneIdx = headers.findIndex(h => h === 'phone' || h === '電話' || h === '電話番号')

    const rows = lines.slice(1).map(line => {
      const cols = line.split(',').map(c => c.trim().replace(/"/g, ''))
      return {
        email: cols[emailIdx],
        first_name: firstNameIdx >= 0 ? cols[firstNameIdx] : undefined,
        last_name: lastNameIdx >= 0 ? cols[lastNameIdx] : undefined,
        phone: phoneIdx >= 0 ? cols[phoneIdx] : undefined,
      }
    }).filter(r => r.email && r.email.includes('@'))

    if (!rows.length) {
      alert('有効なメールアドレスが見つかりません')
      setImporting(false)
      return
    }

    const result = await importContacts(rows)
    setImporting(false)

    if (result.success) {
      alert(`${result.data.imported}件インポート / ${result.data.skipped}件スキップ（重複）`)
      router.refresh()
    } else {
      alert(`インポート失敗: ${result.error}`)
    }

    // Reset file input
    if (fileRef.current) fileRef.current.value = ''
  }

  return (
    <>
      <input
        ref={fileRef}
        type="file"
        accept=".csv"
        className="hidden"
        onChange={handleFile}
      />
      <Button
        variant="outline"
        size="sm"
        className="gap-1.5"
        onClick={() => fileRef.current?.click()}
        disabled={importing}
      >
        <Upload className="w-3.5 h-3.5" /> {importing ? 'インポート中...' : 'CSVインポート'}
      </Button>
    </>
  )
}
