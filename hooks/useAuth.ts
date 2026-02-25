import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { setAccessToken } from '@/lib/api/client'
import { getCurrentUser } from '@/lib/api/auth'
import type { User as SupabaseUser, Session, AuthChangeEvent } from '@supabase/supabase-js'
import type { User as BackendUser } from '@/lib/types/api'

export function useAuth() {
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [backendUser, setBackendUser] = useState<BackendUser | null>(null)
  const [loading, setLoading] = useState(true)
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
        } else if (session) {
          setAccessToken(session.access_token)
          setUser(session.user)
          // loading은 세션 확인 후 즉시 false로 변경
          // fetchBackendUser는 병렬로 진행 (isAdmin은 나중에 업데이트)
          fetchBackendUser()
        } else {
          setAccessToken(null)
          setUser(null)
          setIsAdmin(false)
        }
      } catch (err) {
        console.error('❌ Auth 초기화 에러:', err)
        setAccessToken(null)
        setUser(null)
        setIsAdmin(false)
      } finally {
        // getSession()만 끝나면 loading 해제
        // fetchBackendUser()의 완료를 기다리지 않음
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
            await fetchBackendUser()
          }
        } else {
          setAccessToken(null)
          setUser(null)
          setBackendUser(null)
          setIsAdmin(false)
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase.auth])

  return { user, backendUser, loading, isAdmin }
}
