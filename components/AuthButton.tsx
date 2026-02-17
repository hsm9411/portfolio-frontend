'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import type { User, Session, AuthChangeEvent } from '@supabase/supabase-js'
import Link from 'next/link'

export default function AuthButton() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }: { data: { session: Session | null } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    }).catch(() => setLoading(false))

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event: AuthChangeEvent, session: Session | null) => {
        setUser(session?.user ?? null)
        if (_event === 'SIGNED_IN' || _event === 'SIGNED_OUT') router.refresh()
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase.auth, router])

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleLogout = async () => {
    setOpen(false)
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) {
    return <div className="h-8 w-8 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700" />
  }

  if (user) {
    const displayName =
      user.user_metadata?.nickname ||
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      user.email?.split('@')[0] ||
      '사용자'

    const avatarUrl = user.user_metadata?.avatar_url

    return (
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-2 rounded-full transition-opacity hover:opacity-80"
        >
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={displayName}
              className="h-8 w-8 rounded-full object-cover ring-1 ring-gray-200 dark:ring-white/10"
            />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-900 text-xs font-semibold text-white dark:bg-white dark:text-gray-900">
              {displayName.charAt(0).toUpperCase()}
            </div>
          )}
        </button>

        {/* Dropdown */}
        {open && (
          <div className="absolute right-0 mt-2 w-52 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg dark:border-white/10 dark:bg-gray-900">
            {/* User info */}
            <div className="border-b border-gray-100 px-4 py-3 dark:border-white/[0.06]">
              <p className="text-xs font-semibold text-gray-900 dark:text-white">{displayName}</p>
              <p className="mt-0.5 truncate text-xs text-gray-400">{user.email}</p>
            </div>
            {/* Actions */}
            <div className="p-1.5">
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-500/10"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                로그아웃
              </button>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <Link
        href="/login"
        className="text-xs font-medium text-gray-500 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
      >
        로그인
      </Link>
      <Link
        href="/register"
        className="rounded-full bg-gray-900 px-3.5 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-80 dark:bg-white dark:text-gray-900"
      >
        회원가입
      </Link>
    </div>
  )
}
