import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const origin = requestUrl.origin

  console.log('[OAuth Callback] 시작:', { code: !!code, origin })

  if (code) {
    try {
      const supabase = await createClient()
      
      // OAuth 코드를 세션으로 교환
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        console.error('[OAuth Callback] 에러:', error)
        return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error.message)}`)
      }

      console.log('[OAuth Callback] 성공:', {
        userId: data.user?.id,
        email: data.user?.email,
        provider: data.user?.app_metadata?.provider
      })

      // 성공 - 홈으로 리다이렉트
      return NextResponse.redirect(`${origin}`)
    } catch (err: any) {
      console.error('[OAuth Callback] Exception:', err)
      return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(err.message)}`)
    }
  }

  // code가 없으면 에러
  console.error('[OAuth Callback] Code 없음')
  return NextResponse.redirect(`${origin}/login?error=no_code`)
}
