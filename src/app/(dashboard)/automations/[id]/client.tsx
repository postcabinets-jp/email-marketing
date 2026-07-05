'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Play, Pause, Trash2 } from 'lucide-react'
import { activateWorkflow, pauseWorkflow, deleteWorkflow } from '@/app/actions/workflows'
import { Button } from '@/components/ui/button'

export function WorkflowActions({ workflowId, status }: { workflowId: string; status: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleActivate() {
    setLoading(true)
    setError(null)
    const result = await activateWorkflow(workflowId)
    setLoading(false)
    if (!result.success) setError(result.error)
  }

  async function handlePause() {
    setLoading(true)
    setError(null)
    const result = await pauseWorkflow(workflowId)
    setLoading(false)
    if (!result.success) setError(result.error)
  }

  async function handleDelete() {
    if (!confirm('このワークフローを削除しますか？')) return
    setLoading(true)
    const result = await deleteWorkflow(workflowId)
    if (result.success) {
      router.push('/automations')
    } else {
      setLoading(false)
      setError(result.error)
    }
  }

  return (
    <div>
      <div className="flex items-center gap-2">
        {(status === 'draft' || status === 'paused') && (
          <Button size="sm" onClick={handleActivate} disabled={loading} className="gap-1.5">
            <Play className="w-3.5 h-3.5" /> 有効化
          </Button>
        )}
        {status === 'active' && (
          <Button size="sm" variant="outline" onClick={handlePause} disabled={loading} className="gap-1.5 text-amber-600">
            <Pause className="w-3.5 h-3.5" /> 停止
          </Button>
        )}
        {(status === 'draft' || status === 'paused' || status === 'archived') && (
          <Button size="sm" variant="outline" onClick={handleDelete} disabled={loading} className="gap-1.5 text-red-600 hover:bg-red-50">
            <Trash2 className="w-3.5 h-3.5" /> 削除
          </Button>
        )}
      </div>
      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2 mt-2">{error}</p>
      )}
    </div>
  )
}
