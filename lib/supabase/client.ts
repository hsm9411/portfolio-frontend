import { createBrowserClient } from '@supabase/ssr'

// Singleton 인스턴스로 관리하여 AbortError 방지
let supabaseInstance: ReturnType<typeof createBrowserClient> | null = null

export function createClient() {
  // 이미 생성된 인스턴스가 있으면 재사용
  if (supabaseInstance) {
    return supabaseInstance
  }

  // 새 인스턴스 생성
  supabaseInstance = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        // AbortError 방지: timeout 증가
        flowType: 'pkce',
        detectSessionInUrl: true,
        persistSession: true,
        autoRefreshToken: true,
      },
    }
  )

  return supabaseInstance
}
