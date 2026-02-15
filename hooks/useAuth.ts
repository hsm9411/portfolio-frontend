import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User, Session, AuthChangeEvent } from '@supabase/supabase-js'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    // 초기 세션 확인
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('❌ 세션 확인 에러:', error)
          setUser(null)
          setIsAdmin(false)
        } else if (session) {
          setUser(session.user)
          checkAdmin(session.user.email)
        } else {
          setUser(null)
          setIsAdmin(false)
        }
      } catch (err: unknown) {
        console.error('❌ Auth 초기화 에러:', err)
        setUser(null)
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
      
      // 세션 만료 시 자동 갱신 시도
      if (event === 'TOKEN_REFRESHED') {
        console.log('✅ 토큰 자동 갱신됨')
      } else if (event === 'SIGNED_OUT') {
        console.log('⚠️ 로그아웃됨')
      }
      
      setUser(session?.user ?? null)
      checkAdmin(session?.user?.email)
    })

    // 5분마다 세션 체크 및 갱신 (선택적)
    const intervalId = setInterval(async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        console.log('🔄 세션 유효성 체크 완료')
      }
    }, 5 * 60 * 1000) // 5분

    return () => {
      subscription.unsubscribe()
      clearInterval(intervalId)
    }
  }, [supabase.auth])

  const checkAdmin = (email?: string) => {
    if (!email) {
      setIsAdmin(false)
      return
    }

    const adminEmails = process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(',').map(e => e.trim()) || []
    const isAdminUser = adminEmails.includes(email)
    console.log('🔑 Admin 체크:', { email, isAdmin: isAdminUser, adminEmails })
    setIsAdmin(isAdminUser)
  }

  return { user, loading, isAdmin }
}
