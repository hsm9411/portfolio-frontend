import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getCurrentUser } from '@/lib/api/auth'
import type { User as SupabaseUser, Session, AuthChangeEvent } from '@supabase/supabase-js'
import type { User as BackendUser } from '@/lib/types/api'

export function useAuth() {
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [backendUser, setBackendUser] = useState<BackendUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const supabase = createClient()

  /**
   * Backend /auth/me를 호출해 isAdmin 등 실제 권한 정보 조회
   * Supabase 세션이 있을 때만 호출 (JWT가 있어야 /auth/me 호출 가능)
   */
  const fetchBackendUser = async () => {
    try {
      const user = await getCurrentUser()
      setBackendUser(user)
      setIsAdmin(user.isAdmin)
    } catch (err) {
      // 비인증 상태이거나 Backend 오류 시 권한 없음으로 처리
      console.warn('⚠️ Backend 사용자 정보 조회 실패 (비인증 상태):', err)
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
          setUser(null)
          setBackendUser(null)
          setIsAdmin(false)
        } else if (session) {
          setUser(session.user)
          // 세션이 있으면 Backend에서 실제 isAdmin 조회
          await fetchBackendUser()
        } else {
          setUser(null)
          setBackendUser(null)
          setIsAdmin(false)
        }
      } catch (err: unknown) {
        console.error('❌ Auth 초기화 에러:', err)
        setUser(null)
        setBackendUser(null)
        setIsAdmin(false)
      } finally {
        setLoading(false)
      }
    }

    initializeAuth()

    // 세션 변경 리스너
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, session: Session | null) => {
      console.log('🔄 Auth 상태 변경:', event, session?.user?.email)

      if (event === 'SIGNED_IN' && session) {
        setUser(session.user)
        // 로그인 시 Backend에서 isAdmin 재조회
        await fetchBackendUser()
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
        setBackendUser(null)
        setIsAdmin(false)
      } else if (event === 'TOKEN_REFRESHED' && session) {
        setUser(session.user)
        // 토큰 갱신 시에도 Backend 사용자 정보 유지 (재조회는 필요 시만)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase.auth])

  return { user, backendUser, loading, isAdmin }
}
