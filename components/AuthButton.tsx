'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { User, Session, AuthChangeEvent } from '@supabase/supabase-js'
import Link from 'next/link'

export default function AuthButton() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    // 초기 세션 확인
    supabase.auth.getSession().then(({ data: { session } }: { data: { session: Session | null } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    }).catch((err: unknown) => {
      console.error('세션 확인 실패:', err)
      setLoading(false)
    })

    // 세션 변경 리스너
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, session: Session | null) => {
      setUser(session?.user ?? null)
      
      // 로그인/로그아웃 시 페이지 새로고침
      if (_event === 'SIGNED_IN' || _event === 'SIGNED_OUT') {
        router.refresh()
      }
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth, router])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) {
    return (
      <div className="h-9 w-24 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700"></div>
    )
  }

  if (user) {
    // 닉네임 우선순위: nickname > full_name > name > email
    const displayName = 
      user.user_metadata?.nickname ||
      user.user_metadata?.full_name || 
      user.user_metadata?.name ||
      user.email?.split('@')[0] ||
      '사용자'

    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          {user.user_metadata?.avatar_url && (
            <img
              src={user.user_metadata.avatar_url}
              alt="Avatar"
              className="h-8 w-8 rounded-full ring-2 ring-blue-500"
            />
          )}
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {displayName}님
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {user.email}
            </span>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
        >
          로그아웃
        </button>
      </div>
    )
  }

  return (
    <div className="flex gap-3">
      <Link
        href="/login"
        className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
      >
        로그인
      </Link>
      <Link
        href="/register"
        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
      >
        회원가입
      </Link>
    </div>
  )
}
