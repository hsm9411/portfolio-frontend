import axios, { AxiosInstance, AxiosError } from 'axios'
import type { ApiError } from '@/lib/types/api'

// ============================================
// Configuration
// ============================================

const API_TIMEOUT = 25000 // 25초 (Vercel 권장)

const getBaseURL = () => {
  if (typeof window === 'undefined') {
    return '/api' // Server-side: Vercel 프록시
  }
  return '/api' // Client-side: Vercel 프록시
}

// ============================================
// API Client Instance
// ============================================

const api: AxiosInstance = axios.create({
  baseURL: getBaseURL(),
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
})

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
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session?.access_token) {
          config.headers.Authorization = `Bearer ${session.access_token}`
          
          // Development 환경에서만 로그 출력
          if (process.env.NODE_ENV === 'development') {
            console.log('✅ JWT 토큰 추가:', session.access_token.substring(0, 20) + '...')
          }
        } else {
          // Public API는 토큰 없이도 접근 가능
          if (process.env.NODE_ENV === 'development') {
            console.log('ℹ️ JWT 토큰 없음 (Public API)')
          }
        }
      } catch (error) {
        console.error('❌ 세션 가져오기 실패:', error)
      }
    }
    
    // Development 로그
    if (process.env.NODE_ENV === 'development') {
      console.log('[API Request]', config.method?.toUpperCase(), config.url, {
        hasAuth: !!config.headers.Authorization,
      })
    }
    
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
    // Development 로그
    if (process.env.NODE_ENV === 'development') {
      console.log('[API Response]', response.status, response.config.url)
    }
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

    // 401 Unauthorized → 로그아웃 처리
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        console.warn('⚠️ 인증 만료 - 로그아웃 처리')
        
        try {
          const { createClient } = await import('@/lib/supabase/client')
          const supabase = createClient()
          await supabase.auth.signOut()
          
          // 로그인 페이지로 리다이렉트
          window.location.href = '/login?error=session_expired'
        } catch (signOutError) {
          console.error('로그아웃 실패:', signOutError)
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
