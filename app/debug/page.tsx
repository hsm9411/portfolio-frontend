'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Session } from '@supabase/supabase-js'

export default function DebugPage() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    loadSession()
  }, [])

  const loadSession = async () => {
    const { data: { session }, error } = await supabase.auth.getSession()
    setSession(session)
    setLoading(false)
    
    if (error) {
      console.error('Session error:', error)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.reload()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8 dark:bg-gray-900">
        <div className="mx-auto max-w-4xl">
          <h1 className="mb-4 text-2xl font-bold">로딩 중...</h1>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8 dark:bg-gray-900">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-8 text-3xl font-bold text-gray-900 dark:text-white">
          🔍 디버그 페이지
        </h1>

        {/* 로그인 상태 */}
        <div className="mb-6 rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">
            로그인 상태
          </h2>
          {session ? (
            <div className="space-y-2">
              <p className="text-green-600">✅ 로그인됨</p>
              <button
                onClick={handleLogout}
                className="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700"
              >
                로그아웃
              </button>
            </div>
          ) : (
            <p className="text-red-600">❌ 로그인 안 됨</p>
          )}
        </div>

        {/* 세션 정보 */}
        {session && (
          <>
            <div className="mb-6 rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
              <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">
                사용자 정보
              </h2>
              <div className="space-y-2 text-sm">
                <p><strong>ID:</strong> {session.user.id}</p>
                <p><strong>Email:</strong> {session.user.email}</p>
                <p><strong>Provider:</strong> {session.user.app_metadata?.provider || 'email'}</p>
                <p><strong>Email Confirmed:</strong> {session.user.email_confirmed_at ? '✅ Yes' : '❌ No'}</p>
                <p><strong>Created:</strong> {new Date(session.user.created_at || '').toLocaleString()}</p>
                <p><strong>Last Sign In:</strong> {new Date(session.user.last_sign_in_at || '').toLocaleString()}</p>
              </div>
            </div>

            <div className="mb-6 rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
              <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">
                User Metadata
              </h2>
              <pre className="overflow-auto rounded bg-gray-100 p-4 text-xs dark:bg-gray-900">
                {JSON.stringify(session.user.user_metadata, null, 2)}
              </pre>
            </div>

            <div className="mb-6 rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
              <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">
                Full Session
              </h2>
              <pre className="overflow-auto rounded bg-gray-100 p-4 text-xs dark:bg-gray-900">
                {JSON.stringify(session, null, 2)}
              </pre>
            </div>
          </>
        )}

        {/* OAuth 테스트 */}
        <div className="mb-6 rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">
            OAuth 테스트
          </h2>
          <div className="space-y-3">
            <button
              onClick={async () => {
                try {
                  const { data, error } = await supabase.auth.signInWithOAuth({
                    provider: 'google',
                    options: {
                      redirectTo: `${window.location.origin}/auth/callback`,
                    },
                  })
                  console.log('Google OAuth:', { data, error })
                  if (error) alert(`Google Error: ${error.message}`)
                } catch (err: any) {
                  alert(`Google Exception: ${err.message}`)
                }
              }}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium hover:bg-gray-50"
            >
              Google OAuth 테스트
            </button>

            <button
              onClick={async () => {
                try {
                  const { data, error } = await supabase.auth.signInWithOAuth({
                    provider: 'github',
                    options: {
                      redirectTo: `${window.location.origin}/auth/callback`,
                    },
                  })
                  console.log('GitHub OAuth:', { data, error })
                  if (error) alert(`GitHub Error: ${error.message}`)
                } catch (err: any) {
                  alert(`GitHub Exception: ${err.message}`)
                }
              }}
              className="w-full rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
            >
              GitHub OAuth 테스트
            </button>
          </div>
        </div>

        {/* 환경변수 확인 */}
        <div className="mb-6 rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">
            환경변수
          </h2>
          <div className="space-y-2 text-sm">
            <p><strong>SUPABASE_URL:</strong> {process.env.NEXT_PUBLIC_SUPABASE_URL}</p>
            <p><strong>SUPABASE_ANON_KEY:</strong> {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 30)}...</p>
            <p><strong>API_URL:</strong> {process.env.NEXT_PUBLIC_API_URL || '/api'}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
