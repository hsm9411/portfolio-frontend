import axios from 'axios'

// 테스트용: 직접 백엔드 호출
const USE_DIRECT = true

const getBaseURL = () => {
  if (typeof window === 'undefined') {
    return '/api'
  }
  
  // 테스트: 직접 백엔드 호출
  if (USE_DIRECT) {
    return 'http://158.180.75.205:3001'
  }
  
  return '/api'
}

const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use(
  async (config) => {
    if (typeof window !== 'undefined') {
      try {
        const { createClient } = await import('@/lib/supabase/client')
        const supabase = createClient()
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session?.access_token) {
          config.headers.Authorization = `Bearer ${session.access_token}`
          console.log('✅ JWT 토큰 추가됨:', session.access_token.substring(0, 20) + '...')
          console.log('📍 Base URL:', config.baseURL)
          console.log('📍 Full URL:', `${config.baseURL}${config.url}`)
        } else {
          console.warn('⚠️ JWT 토큰 없음 - 로그인 필요')
        }
      } catch (error) {
        console.error('❌ 세션 가져오기 실패:', error)
      }
    }
    
    console.log('[API Request]', config.method?.toUpperCase(), config.url, {
      hasAuth: !!config.headers.Authorization
    })
    return config
  },
  (error) => {
    console.error('[API Request Error]', error)
    return Promise.reject(error)
  }
)

api.interceptors.response.use(
  (response) => {
    console.log('[API Response]', response.status, response.config.url)
    return response
  },
  (error) => {
    console.error('[API Response Error]', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.message,
      data: error.response?.data,
      hasAuth: !!error.config?.headers?.Authorization
    })
    return Promise.reject(error)
  }
)

export default api
