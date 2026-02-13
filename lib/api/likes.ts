import api from './client'
import type { LikeTargetType, LikeStatus } from '@/lib/types/api'

// ============================================
// Re-export Types
// ============================================
export type { LikeTargetType, LikeStatus }

// ============================================
// Likes API
// ============================================

/**
 * 좋아요 상태 조회
 */
export async function getLikeStatus(
  targetType: LikeTargetType,
  targetId: string
): Promise<LikeStatus> {
  const response = await api.get<LikeStatus>(`/likes/${targetType}/${targetId}`)
  return response.data
}

/**
 * 좋아요 토글 (좋아요/취소)
 * @returns 업데이트된 좋아요 상태
 */
export async function toggleLike(
  targetType: LikeTargetType,
  targetId: string
): Promise<LikeStatus> {
  const response = await api.post<LikeStatus>(`/likes/${targetType}/${targetId}`)
  return response.data
}
