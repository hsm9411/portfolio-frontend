import axios from 'axios'

// Vercel 배포 환경에서는 /api 프록시 사용
// 로컬 환경에서는 직접 백엔드 호출
const getBaseURL = () => {
  // 브라우저 환경에서만 실행
  if (typeof window === 'undefined') {
    return '/api' // 서버 사이드는 항상 /api 사용
  }
  
  // Vercel 배포 환경 (HTTPS)
  if (window.location.protocol === 'https:') {
    return '/api' // Vercel rewrites 프록시 사용
  }
  
  // 로컬 개발 환경 (HTTP)
  return process.env.NEXT_PUBLIC_API_URL || 'http://158.180.75.205:3001'
}

const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
})

// 요청 인터셉터: 에러 로깅
api.interceptors.request.use(
  (config) => {
    console.log('[API Request]', config.method?.toUpperCase(), config.url)
    return config
  },
  (error) => {
    console.error('[API Request Error]', error)
    return Promise.reject(error)
  }
)

// 응답 인터셉터: 에러 로깅
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
    })
    return Promise.reject(error)
  }
)

export default api
