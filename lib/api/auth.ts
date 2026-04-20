import api from './client'
import type { User } from '@/lib/types/api'

export type { User }

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
