'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Send, Clock, Trash2, Copy, XCircle } from 'lucide-react'
import { sendCampaign, deleteCampaign, duplicateCampaign, scheduleCampaign, cancelCampaign } from '@/app/actions/campaigns'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function CampaignActions({ campaignId, status }: { campaignId: string; status: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [scheduling, setScheduling] = useState(false)
  const [scheduleDate, setScheduleDate] = useState('')
  const [error, setError] = useState<string | null>(null)

  async function handleSend() {
    if (!confirm('このキャンペーンを今すぐ送信しますか？')) return
    setLoading(true)
    setError(null)
    const result = await sendCampaign(campaignId)
    setLoading(false)
    if (!result.success) setError(result.error)
  }

  async function handleSchedule() {
    if (!scheduleDate) return
    setLoading(true)
    setError(null)
    const result = await scheduleCampaign(campaignId, scheduleDate)
    setLoading(false)
    if (result.success) {
      setScheduling(false)
    } else {
      setError(result.error)
    }
  }

  async function handleCancel() {
    if (!confirm('予約をキャンセルしますか？')) return
    setLoading(true)
    const result = await cancelCampaign(campaignId)
    setLoading(false)
    if (!result.success) setError(result.error)
  }

  async function handleDuplicate() {
    setLoading(true)
    const result = await duplicateCampaign(campaignId)
    setLoading(false)
    if (result.success) {
      router.push(`/campaigns/${result.data.id}`)
    } else {
      setError(result.error)
    }
  }

  async function handleDelete() {
    if (!confirm('このキャンペーンを削除しますか？')) return
    setLoading(true)
    const result = await deleteCampaign(campaignId)
    if (result.success) {
      router.push('/campaigns')
    } else {
      setLoading(false)
      setError(result.error)
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        {status === 'draft' && (
          <>
            <Button size="sm" onClick={handleSend} disabled={loading} className="gap-1.5">
              <Send className="w-3.5 h-3.5" /> 今すぐ送信
            </Button>
            <Button size="sm" variant="outline" onClick={() => setScheduling(!scheduling)} disabled={loading} className="gap-1.5">
              <Clock className="w-3.5 h-3.5" /> 予約送信
            </Button>
          </>
        )}
        {status === 'scheduled' && (
          <Button size="sm" variant="outline" onClick={handleCancel} disabled={loading} className="gap-1.5 text-orange-600 hover:text-orange-700">
            <XCircle className="w-3.5 h-3.5" /> 予約キャンセル
          </Button>
        )}
        <Button size="sm" variant="outline" onClick={handleDuplicate} disabled={loading} className="gap-1.5">
          <Copy className="w-3.5 h-3.5" /> 複製
        </Button>
        {(status === 'draft' || status === 'cancelled') && (
          <Button size="sm" variant="outline" onClick={handleDelete} disabled={loading} className="gap-1.5 text-red-600 hover:text-red-700 hover:bg-red-50">
            <Trash2 className="w-3.5 h-3.5" /> 削除
          </Button>
        )}
      </div>
      {scheduling && (
        <div className="flex items-center gap-2 bg-gray-50 p-3 rounded-lg">
          <Input
            type="datetime-local"
            value={scheduleDate}
            onChange={e => setScheduleDate(e.target.value)}
            className="w-auto"
          />
          <Button size="sm" onClick={handleSchedule} disabled={!scheduleDate || loading}>
            予約確定
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setScheduling(false)}>
            キャンセル
          </Button>
        </div>
      )}
      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">{error}</p>
      )}
    </div>
  )
}
