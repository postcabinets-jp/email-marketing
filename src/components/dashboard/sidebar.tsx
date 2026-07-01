'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  List,
  Filter,
  Mail,
  FileText,
  Zap,
  Settings,
  ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/dashboard', label: 'ダッシュボード', icon: LayoutDashboard },
  { href: '/contacts', label: '連絡先', icon: Users },
  { href: '/lists', label: 'リスト', icon: List },
  { href: '/segments', label: 'セグメント', icon: Filter },
  { href: '/campaigns', label: 'キャンペーン', icon: Mail },
  { href: '/templates', label: 'テンプレート', icon: FileText },
  { href: '/automations', label: 'オートメーション', icon: Zap },
  { href: '/settings', label: '設定', icon: Settings },
]

interface Props {
  orgName: string
  orgSlug: string
}

export function DashboardSidebar({ orgName }: Props) {
  const pathname = usePathname()

  return (
    <aside className="w-56 bg-white border-r border-gray-200 flex flex-col shrink-0">
      {/* Logo / Brand */}
      <div className="h-14 flex items-center px-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-gray-900 rounded flex items-center justify-center">
            <Mail className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-gray-900 text-sm truncate max-w-[120px]">{orgName}</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 px-2 space-y-0.5">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = href === '/dashboard'
            ? pathname === '/dashboard'
            : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                active
                  ? 'bg-gray-100 text-gray-900'
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-gray-200">
        <Link
          href="/settings"
          className="flex items-center justify-between px-3 py-2 rounded-md text-xs text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <span>設定・請求</span>
          <ChevronRight className="w-3 h-3" />
        </Link>
      </div>
    </aside>
  )
}
