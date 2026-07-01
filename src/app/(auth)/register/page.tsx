'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function RegisterPage() {
  const router = useRouter()
  const [fullName, setFullName] = useState('')
  const [orgName, setOrgName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  function toSlug(name: string) {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${location.origin}/auth/callback`,
      },
    })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    if (data.user) {
      // Create org + membership via server action
      const res = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orgName,
          slug: toSlug(orgName),
          userId: data.user.id,
        }),
      })
      if (!res.ok) {
        const body = await res.json()
        setError(body.error ?? 'Organization setup failed')
        setLoading(false)
        return
      }
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-lg border border-gray-200 p-8 shadow-sm">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">アカウント作成</h1>
          <p className="text-sm text-gray-500 mt-1">無料プランで今すぐ始めましょう（1万件まで無料）</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <Label htmlFor="fullName">お名前</Label>
            <Input
              id="fullName"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              placeholder="山田 太郎"
              required
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="orgName">組織・ブランド名</Label>
            <Input
              id="orgName"
              value={orgName}
              onChange={e => setOrgName(e.target.value)}
              placeholder="Haruki Coffee Roasters"
              required
              className="mt-1"
            />
            {orgName && (
              <p className="text-xs text-gray-400 mt-1">スラグ: {toSlug(orgName)}</p>
            )}
          </div>
          <div>
            <Label htmlFor="email">メールアドレス</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="password">パスワード（8文字以上）</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              minLength={8}
              required
              className="mt-1"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">{error}</p>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? '作成中...' : '無料で始める'}
          </Button>
        </form>

        <p className="text-center text-xs text-gray-400 mt-4">
          登録することで
          <a href="#" className="text-blue-600 hover:underline mx-1">利用規約</a>
          および
          <a href="#" className="text-blue-600 hover:underline mx-1">プライバシーポリシー</a>
          に同意したものとみなされます。
        </p>

        <p className="text-center text-sm text-gray-500 mt-4">
          すでにアカウントをお持ちの方は{' '}
          <Link href="/login" className="text-blue-600 hover:underline">
            ログイン
          </Link>
        </p>
      </div>
    </div>
  )
}
