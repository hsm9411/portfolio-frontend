import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    // 초기 세션 확인
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      checkAdmin(session?.user?.email)
      setLoading(false)
    })

    // 세션 변경 리스너
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      checkAdmin(session?.user?.email)
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  const checkAdmin = (email?: string) => {
    if (!email) {
      setIsAdmin(false)
      return
    }

    const adminEmails = process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(',').map(e => e.trim()) || []
    setIsAdmin(adminEmails.includes(email))
  }

  return { user, loading, isAdmin }
}
