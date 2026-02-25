import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { setAccessToken } from '@/lib/api/client'
import { getCurrentUser } from '@/lib/api/auth'
import type { User as SupabaseUser, Session, AuthChangeEvent } from '@supabase/supabase-js'
import type { User as BackendUser } from '@/lib/types/api'

export function useAuth() {
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [backendUser, setBackendUser] = useState<BackendUser | null>(null)
  const [loading, setLoading] = useState(true)       // getSession() 완료 여부
  const [authReady, setAuthReady] = useState(false)  // isAdmin까지 확정 여부
  const [isAdmin, setIsAdmin] = useState(false)
  const supabase = createClient()

  const fetchBackendUser = async () => {
    try {
      const user = await getCurrentUser()
      setBackendUser(user)
      setIsAdmin(user.isAdmin)
    } catch (err) {
      console.warn('⚠️ Backend 사용자 정보 조회 실패:', err)
      setBackendUser(null)
      setIsAdmin(false)
    } finally {
      setAuthReady(true) // 성공/실패 무관하게 isAdmin 확정
    }
  }

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()

        if (error) {
          console.error('❌ 세션 확인 에러:', error)
          setAccessToken(null)
          setUser(null)
          setIsAdmin(false)
          setAuthReady(true)
        } else if (session) {
          setAccessToken(session.access_token)
          setUser(session.user)
          // loading 해제 후 fetchBackendUser 병렬 진행
          // authReady는 fetchBackendUser 완료 시 true
          fetchBackendUser()
        } else {
          // 비로그인: isAdmin=false로 즉시 확정
          setAccessToken(null)
          setUser(null)
          setIsAdmin(false)
          setAuthReady(true)
        }
      } catch (err) {
        console.error('❌ Auth 초기화 에러:', err)
        setAccessToken(null)
        setUser(null)
        setIsAdmin(false)
        setAuthReady(true)
      } finally {
        setLoading(false)
      }
    }

    initializeAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        if (session) {
          setAccessToken(session.access_token)
          setUser(session.user)

          if (event === 'SIGNED_IN') {
            setAuthReady(false)
            await fetchBackendUser()
          }
        } else {
          setAccessToken(null)
          setUser(null)
          setBackendUser(null)
          setIsAdmin(false)
          setAuthReady(true)
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase.auth])

  return { user, backendUser, loading, authReady, isAdmin }
}
