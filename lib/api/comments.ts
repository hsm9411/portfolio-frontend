import api from './client'
import type {
  Comment,
  CommentTargetType,
  CreateCommentRequest,
  UpdateCommentRequest,
  PaginatedResponse,
} from '@/lib/types/api'

// ============================================
// Re-export Types
// ============================================
export type {
  Comment,
  CommentTargetType,
  CreateCommentRequest,
  UpdateCommentRequest
}

// ============================================
// Comments API
// ============================================

export async function getComments(
  targetType: CommentTargetType,
  targetId: string,
  page = 1,
  limit = 10
): Promise<PaginatedResponse<Comment>> {
  const response = await api.get<PaginatedResponse<Comment>>(
    `/comments/${targetType}/${targetId}`,
    { params: { page, limit } }
  )
  return response.data
}

/**
 * 댓글 작성 (로그인 필수, 익명 옵션 가능)
 */
export async function createComment(
  targetType: CommentTargetType,
  targetId: string,
  data: CreateCommentRequest
): Promise<Comment> {
  const response = await api.post<Comment>(
    `/comments/${targetType}/${targetId}`,
    data
  )
  return response.data
}

/**
 * 댓글 수정 (작성자만)
 */
export async function updateComment(
  id: string,
  data: UpdateCommentRequest
): Promise<Comment> {
  const response = await api.put<Comment>(`/comments/${id}`, data)
  return response.data
}

/**
 * 댓글 삭제 (작성자 또는 Admin)
 */
export async function deleteComment(id: string): Promise<{ message: string }> {
  const response = await api.delete<{ message: string }>(`/comments/${id}`)
  return response.data
}
