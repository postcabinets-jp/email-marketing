import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Plus, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default async function TemplatesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: membership } = await supabase
    .from('memberships').select('organization_id').eq('user_id', user.id).limit(1).single()
  const orgId = membership?.organization_id

  const { data: templates } = await supabase
    .from('email_templates')
    .select('id,name,subject,preview_text,is_global,updated_at')
    .or(`organization_id.eq.${orgId},is_global.eq.true`)
    .order('updated_at', { ascending: false })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">テンプレート</h1>
          <p className="text-sm text-gray-500 mt-0.5">{templates?.length ?? 0} 件</p>
        </div>
        <Button size="sm" className="gap-1.5" asChild>
          <Link href="/editor/new"><Plus className="w-3.5 h-3.5" /> 新規作成</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates?.map(t => (
          <div key={t.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:border-gray-400 transition-colors">
            <div className="h-32 bg-gray-50 flex items-center justify-center border-b border-gray-200">
              <FileText className="w-10 h-10 text-gray-300" />
            </div>
            <div className="p-4">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-medium text-gray-900 text-sm">{t.name}</h3>
                {t.is_global && (
                  <span className="text-xs bg-purple-50 text-purple-700 px-1.5 py-0.5 rounded shrink-0">グローバル</span>
                )}
              </div>
              {t.subject && <p className="text-xs text-gray-500 mt-1 truncate">{t.subject}</p>}
              {t.preview_text && <p className="text-xs text-gray-400 mt-0.5 truncate">{t.preview_text}</p>}
              <div className="flex items-center justify-between mt-3">
                <span className="text-xs text-gray-400">{new Date(t.updated_at).toLocaleDateString('ja-JP')}</span>
                <Link href={`/editor/${t.id}`} className="text-xs text-blue-600 hover:underline">編集</Link>
              </div>
            </div>
          </div>
        ))}
        {!templates?.length && (
          <div className="col-span-3 py-16 text-center text-sm text-gray-400">
            まだテンプレートがありません。
            <Link href="/editor/new" className="text-blue-600 hover:underline ml-1">最初のテンプレートを作成する</Link>
          </div>
        )}
      </div>
    </div>
  )
}
