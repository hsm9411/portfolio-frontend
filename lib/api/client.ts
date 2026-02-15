import axios, { AxiosInstance, AxiosError } from 'axios'
import type { ApiError } from '@/lib/types/api'

// ============================================
// Configuration
// ============================================

const API_TIMEOUT = 25000 // 25초

// Backend가 HTTPS를 지원하므로 직접 연결
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://158.180.75.205'

console.log('🌐 API Client 초기화:', {
  baseURL: API_BASE_URL,
  isProduction: process.env.NODE_ENV === 'production',
})

// ============================================
// API Client Instance
// ============================================

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
  // Self-Signed SSL 인증서 허용 (개발 환경)
  // Production에서는 Let's Encrypt 사용 시 이 옵션 제거
})

// 401 에러 처리 중복 방지 플래그
let isRedirecting = false

// ============================================
// Request Interceptor (JWT 토큰 자동 추가)
// ============================================

api.interceptors.request.use(
  async (config) => {
    // Client-side only
    if (typeof window !== 'undefined') {
      try {
        const { createClient } = await import('@/lib/supabase/client')
        const supabase = createClient()
        const { data: { session }, error } = await supabase.auth.getSession()
        
        console.log('🔍 세션 확인:', { 
          hasSession: !!session, 
          hasToken: !!session?.access_token,
          email: session?.user?.email,
          error: error?.message 
        })
        
        if (session?.access_token) {
          config.headers.Authorization = `Bearer ${session.access_token}`
          console.log('✅ JWT 토큰 추가:', session.access_token.substring(0, 30) + '...')
        } else {
          console.warn('⚠️ JWT 토큰 없음 - 세션 없음 또는 만료됨')
        }
      } catch (error) {
        console.error('❌ 세션 가져오기 실패:', error)
      }
    }
    
    // Request 로그
    console.log('[API Request]', {
      method: config.method?.toUpperCase(),
      url: config.url,
      fullURL: `${config.baseURL}${config.url}`,
      hasAuth: !!config.headers.Authorization,
    })
    
    return config
  },
  (error) => {
    console.error('[API Request Error]', error)
    return Promise.reject(error)
  }
)

// ============================================
// Response Interceptor (에러 처리)
// ============================================

api.interceptors.response.use(
  (response) => {
    console.log('[API Response]', {
      status: response.status,
      url: response.config.url,
    })
    return response
  },
  async (error: AxiosError<ApiError>) => {
    // 에러 로그
    console.error('[API Response Error]', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
      hasAuth: !!error.config?.headers?.Authorization,
    })

    // 401 Unauthorized → 세션이 있었는데 만료된 경우만 로그아웃
    if (error.response?.status === 401 && !isRedirecting) {
      if (typeof window !== 'undefined') {
        // 세션이 있었는지 확인
        const hadAuth = !!error.config?.headers?.Authorization
        
        if (hadAuth) {
          // 토큰이 있었는데 401이면 → 토큰 만료
          console.warn('⚠️ 인증 토큰 만료 - 로그인 페이지로 이동')
          isRedirecting = true
          
          try {
            const { createClient } = await import('@/lib/supabase/client')
            const supabase = createClient()
            await supabase.auth.signOut()
          } catch (signOutError) {
            console.error('로그아웃 실패:', signOutError)
          }
          
          // 현재 페이지 URL 저장
          const currentPath = window.location.pathname + window.location.search
          window.location.href = `/login?error=session_expired&redirect=${encodeURIComponent(currentPath)}`
        } else {
          // 토큰이 없었는데 401이면 → 애초에 로그인 안 함
          console.warn('⚠️ 로그인 필요 - 세션 없음')
        }
      }
    }

    // 403 Forbidden
    if (error.response?.status === 403) {
      console.error('⛔ 권한 없음:', error.response.data?.message)
    }

    // 404 Not Found
    if (error.response?.status === 404) {
      console.error('🔍 리소스 없음:', error.config?.url)
    }

    // 500 Internal Server Error
    if (error.response?.status === 500) {
      console.error('💥 서버 오류:', error.response.data?.message)
    }

    // 에러 메시지 표준화
    const apiError: ApiError = {
      message: error.response?.data?.message || error.message || '요청 실패',
      statusCode: error.response?.status || 500,
      error: error.response?.data?.error,
    }

    return Promise.reject(apiError)
  }
)

// ============================================
// Export
// ============================================

export default api

// Helper: 에러 메시지 추출
export function getErrorMessage(error: unknown): string {
  if (typeof error === 'string') return error
  
  if (error && typeof error === 'object' && 'message' in error) {
    return (error as ApiError).message
  }
  
  return '알 수 없는 오류가 발생했습니다.'
}
