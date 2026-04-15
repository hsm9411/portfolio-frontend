import axios, { AxiosInstance, AxiosError } from 'axios'
import type { ApiError } from '@/lib/types/api'

// ============================================
// Configuration
// ============================================

const API_TIMEOUT = 25000 // 25초

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL

// ============================================
// Session Token Store
// 모듈 레벨에서 토큰을 관리.
// Supabase onAuthStateChange가 변경 시 업데이트하고,
// interceptor는 동기적으로 참조만 한다. (매 요청마다 getSession() 호출 제거)
// ============================================

let _accessToken: string | null = null

export function setAccessToken(token: string | null) {
  _accessToken = token
}

export function getAccessToken(): string | null {
  return _accessToken
}

// ============================================
// API Client Instance
// ============================================

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 401 에러 처리 중복 방지 플래그
let isRedirecting = false

// ============================================
// Request Interceptor
// getSession() 비동기 호출 제거 → 동기적으로 토큰 참조
// ============================================

api.interceptors.request.use(
  (config) => {
    const token = getAccessToken()

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error) => {
    console.error('[API Request Error]', error)
    return Promise.reject(error)
  }
)

// ============================================
// Response Interceptor
// ============================================

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiError>) => {
    console.error('[API Response Error]', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
    })

    if (error.response?.status === 400) {
      const errorData = error.response.data
      if (Array.isArray(errorData?.message)) {
        console.error('검증 에러:', errorData.message.join(', '))
      }
    }

    // 401: 토큰이 있었는데 만료된 경우만 로그아웃
    if (error.response?.status === 401 && !isRedirecting) {
      if (typeof window !== 'undefined' && !!error.config?.headers?.Authorization) {
        isRedirecting = true
        setAccessToken(null)

        try {
          const { createClient } = await import('@/lib/supabase/client')
          const supabase = createClient()
          await supabase.auth.signOut()
        } catch (signOutError) {
          console.error('로그아웃 실패:', signOutError)
        }

        const currentPath = window.location.pathname + window.location.search
        window.location.href = `/login?error=session_expired&redirect=${encodeURIComponent(currentPath)}`
      }
    }

    const apiError: ApiError = {
      message: error.response?.data?.message || error.message || '요청 실패',
      statusCode: error.response?.status || 500,
      error: error.response?.data?.error,
    }

    return Promise.reject(apiError)
  }
)

export default api

export function getErrorMessage(error: unknown): string {
  if (typeof error === 'string') return error
  if (error && typeof error === 'object' && 'message' in error) {
    const apiError = error as ApiError
    if (Array.isArray(apiError.message)) return apiError.message.join(', ')
    return apiError.message as string
  }
  return '알 수 없는 오류가 발생했습니다.'
}
