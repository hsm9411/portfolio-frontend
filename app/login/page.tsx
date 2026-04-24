'use client'

import { useState, useEffect, Suspense } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import type { Session } from '@supabase/supabase-js'

function LoginForm() {
  const [error, setError] = useState('')
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  // 리다이렉트 URL — 외부 도메인으로의 오픈 리다이렉트 방지
  // '/'로 시작하지 않거나 '//'로 시작하는 값(프로토콜 상대 URL)은 홈으로 fallback
  const raw = searchParams.get('redirect') || '/'
  const redirectUrl = raw.startsWith('/') && !raw.startsWith('//') ? raw : '/'

  // 로그인 상태 확인
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }: { data: { session: Session | null } }) => {
      if (session) {
        setIsLoggedIn(true)
        setTimeout(() => {
          router.push(redirectUrl)
        }, 1500)
      }
    }).catch((err: unknown) => {
      console.error('세션 확인 실패:', err)
    })
  }, [supabase.auth, router, redirectUrl])

  // URL 에러 파라미터 확인
  useEffect(() => {
    const errorParam = searchParams.get('error')
    if (errorParam) {
      if (errorParam === 'session_expired') {
        setError('세션이 만료되었습니다. 다시 로그인해주세요.')
      } else {
        setError(`OAuth 에러: ${decodeURIComponent(errorParam)}`)
      }
    }
  }, [searchParams])

  // OAuth 로그인 핸들러
  const handleOAuthLogin = async (provider: 'google' | 'github' | 'kakao') => {
    setError('')
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(redirectUrl)}`,
        },
      })

      if (error) {
        console.error(`❌ ${provider} OAuth 에러:`, error)
        throw error
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : ''
      console.error(`${provider} login failed:`, err)

      if (message.includes('provider is not enabled')) {
        setError(`${provider === 'kakao' ? '카카오톡' : provider === 'google' ? 'Google' : 'GitHub'} 로그인이 활성화되지 않았습니다.\n\nSupabase Dashboard에서 ${provider} Provider를 활성화해주세요.`)
      } else {
        setError(`${provider} 로그인 실패: ${message}`)
      }
    }
  }

  if (isLoggedIn) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 dark:bg-zinc-900">
        <div className="text-center">
          <div className="mb-4 text-6xl">✅</div>
          <h1 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
            이미 로그인되어 있습니다
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            잠시 후 {redirectUrl === '/' ? '홈' : '원래 페이지'}으로 이동합니다...
          </p>
          <Link
            href={redirectUrl}
            className="mt-4 inline-block text-indigo-600 hover:text-indigo-700"
          >
            지금 이동하기 →
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 dark:bg-zinc-900">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            로그인
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            포트폴리오 사이트에 오신 것을 환영합니다
          </p>
          {searchParams.get('error') === 'session_expired' && (
            <div className="mt-4 rounded-lg bg-yellow-50 p-3 text-sm text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200">
              ⏰ 세션이 만료되었습니다. 다시 로그인해주세요.
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-4 text-sm text-red-600 dark:bg-red-900/30 dark:text-red-400">
            <div className="whitespace-pre-line">❌ {error}</div>
          </div>
        )}

        {/* OAuth Buttons */}
        <div className="mb-6 space-y-3">
          <button
            onClick={() => handleOAuthLogin('google')}
            type="button"
            className="flex w-full items-center justify-center gap-3 rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 hover:bg-zinc-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Google로 계속하기
          </button>

          <button
            onClick={() => handleOAuthLogin('github')}
            type="button"
            className="flex w-full items-center justify-center gap-3 rounded-lg bg-gray-900 px-4 py-3 text-sm font-medium text-white hover:bg-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600"
          >
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd"/>
            </svg>
            GitHub로 계속하기
          </button>

          <button
            onClick={() => handleOAuthLogin('kakao')}
            type="button"
            className="flex w-full items-center justify-center gap-3 rounded-lg bg-[#FEE500] px-4 py-3 text-sm font-medium text-[#000000] hover:bg-[#FDD835]"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 3C6.477 3 2 6.477 2 10.75c0 2.567 1.656 4.823 4.156 6.184l-1.077 3.923c-.094.344.281.625.594.438l4.531-2.719C11.156 18.813 12 19 12 19c5.523 0 10-3.477 10-7.75S17.523 3 12 3z"/>
            </svg>
            카카오톡으로 계속하기
          </button>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
          소셜 계정으로 로그인하면 자동으로 회원가입됩니다.
        </div>

        <div className="mt-4 text-center">
          <Link
            href="/"
            className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
          >
            ← 홈으로 돌아가기
          </Link>
        </div>

        {/* Debug Link */}
        <div className="mt-4 text-center">
          <Link
            href="/debug"
            className="text-xs text-gray-400 hover:text-gray-600"
          >
            🔍 디버그 페이지
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-indigo-600"></div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
