import api from './client'
import type {
  User,
  AuthResponse,
  LoginRequest,
  RegisterRequest,
} from '@/lib/types/api'

// ============================================
// Re-export Types
// ============================================
export type { User, AuthResponse, LoginRequest, RegisterRequest }

// ============================================
// Auth API
// ============================================

/**
 * 회원가입 (Local)
 */
export async function register(data: RegisterRequest): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>('/auth/register', data)
  return response.data
}

/**
 * 로그인 (Local)
 */
export async function login(data: LoginRequest): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>('/auth/login', data)
  return response.data
}

/**
 * 현재 사용자 정보 조회
 */
export async function getCurrentUser(): Promise<User> {
  const response = await api.get<User>('/auth/me')
  return response.data
}

/**
 * OAuth 사용자 동기화 (선택)
 */
export async function syncOAuthUser(): Promise<{ message: string; user: User }> {
  const response = await api.post<{ message: string; user: User }>(
    '/auth/sync-oauth-user'
  )
  return response.data
}
