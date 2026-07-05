'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Save, ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { createTemplate, updateTemplate } from '@/app/actions/templates'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function EmailEditorPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const isNew = id === 'new'

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [subject, setSubject] = useState('')
  const [html, setHtml] = useState(`<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="font-family:'Helvetica Neue',Arial,sans-serif;color:#1a1a1a;max-width:600px;margin:0 auto;padding:32px 16px">
  <h1 style="font-size:24px;font-weight:700;margin-bottom:16px">件名</h1>
  <p>こんにちは {{first_name}} さん、</p>
  <p>本文をここに入力してください。</p>
  <hr style="border:none;border-top:1px solid #e5e5e5;margin:32px 0">
  <p style="font-size:12px;color:#666">配信停止は<a href="{{unsubscribe_url}}">こちら</a></p>
</body>
</html>`)

  useEffect(() => {
    if (!isNew) {
      const supabase = createClient()
      supabase.from('email_templates').select('*').eq('id', id).single().then(({ data }) => {
        if (data) {
          setName(data.name)
          setSubject(data.subject ?? '')
          setHtml(data.html_body)
        }
      })
    }
  }, [id, isNew])

  async function handleSave() {
    setSaving(true)
    setError(null)

    if (isNew) {
      const formData = new FormData()
      formData.set('name', name || '無題のテンプレート')
      formData.set('subject', subject)
      formData.set('html_body', html)
      const result = await createTemplate(formData)
      setSaving(false)
      if (result.success) {
        router.push(`/editor/${result.data.id}`)
      } else {
        setError(result.error)
      }
    } else {
      const result = await updateTemplate(id, { name, subject, html_body: html })
      setSaving(false)
      if (!result.success) {
        setError(result.error)
      }
    }
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center gap-3 mb-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/templates"><ArrowLeft className="w-4 h-4" /></Link>
        </Button>
        <Input value={name} onChange={e => setName(e.target.value)} placeholder="テンプレート名" className="max-w-xs" />
        <Input value={subject} onChange={e => setSubject(e.target.value)} placeholder="件名（任意）" className="max-w-xs" />
        <Button size="sm" className="gap-1.5 ml-auto" onClick={handleSave} disabled={saving}>
          <Save className="w-3.5 h-3.5" /> {saving ? '保存中...' : '保存'}
        </Button>
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2 mb-4">{error}</p>
      )}

      <Tabs defaultValue="editor" className="flex-1 flex flex-col">
        <TabsList className="w-fit">
          <TabsTrigger value="editor">HTMLエディタ</TabsTrigger>
          <TabsTrigger value="preview">プレビュー</TabsTrigger>
        </TabsList>
        <TabsContent value="editor" className="flex-1">
          <div className="space-y-2">
            <Label className="text-xs text-gray-500">
              使用可能な変数: {'{{first_name}}'} {'{{last_name}}'} {'{{email}}'} {'{{unsubscribe_url}}'}
            </Label>
            <Textarea
              value={html}
              onChange={e => setHtml(e.target.value)}
              className="font-mono text-xs h-[calc(100vh-280px)] resize-none"
            />
          </div>
        </TabsContent>
        <TabsContent value="preview" className="flex-1">
          <div className="border border-gray-200 rounded-lg overflow-hidden h-[calc(100vh-280px)]">
            <iframe
              srcDoc={html.replace('{{first_name}}', '太郎').replace('{{unsubscribe_url}}', '#')}
              className="w-full h-full"
              title="Email preview"
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
