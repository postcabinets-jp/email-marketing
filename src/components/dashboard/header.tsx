'use client'

import { useRouter } from 'next/navigation'
import { useState, useRef, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Badge } from '@/components/ui/badge'

interface Props {
  user: { email: string; name?: string }
  org: { id: string; name: string; slug: string; plan: string; monthly_send_limit: number; sends_this_month: number }
}

const planLabels: Record<string, string> = {
  free: 'Free',
  starter: 'Starter',
  business: 'Business',
  enterprise: 'Enterprise',
}

export function DashboardHeader({ user, org }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const usedPct = org.monthly_send_limit > 0 ? Math.round((org.sends_this_month / org.monthly_send_limit) * 100) : 0
  const initials = (user.name ?? user.email).slice(0, 2).toUpperCase()

  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span>月次送信</span>
          <span className="font-medium text-gray-800">
            {org.sends_this_month.toLocaleString()} / {org.monthly_send_limit.toLocaleString()}
          </span>
          <div className="w-24 h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${usedPct > 90 ? 'bg-red-500' : usedPct > 70 ? 'bg-amber-500' : 'bg-emerald-500'}`}
              style={{ width: `${Math.min(usedPct, 100)}%` }}
            />
          </div>
          <span>{usedPct}%</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Badge variant="outline" className="text-xs font-normal">
          {planLabels[org.plan] ?? org.plan}
        </Badge>

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setOpen(v => !v)}
            className="w-8 h-8 rounded-full bg-gray-900 text-white text-xs font-semibold flex items-center justify-center hover:opacity-90 transition-opacity"
          >
            {initials}
          </button>
          {open && (
            <div className="absolute right-0 top-10 z-50 w-48 bg-white rounded-lg border border-gray-200 shadow-lg py-1">
              <div className="px-3 py-2 border-b border-gray-100">
                <p className="text-sm font-medium text-gray-900 truncate">{user.name ?? user.email}</p>
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
              </div>
              <a href="/settings" className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setOpen(false)}>設定</a>
              <a href="/settings/team" className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setOpen(false)}>チーム管理</a>
              <div className="border-t border-gray-100 mt-1 pt-1">
                <button onClick={handleLogout} className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50">
                  ログアウト
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
