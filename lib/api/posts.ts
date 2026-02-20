import api from './client'
import type {
  Post,
  GetPostsRequest,
  PaginatedResponse,
  CreatePostRequest,
  UpdatePostRequest,
} from '@/lib/types/api'

// ============================================
// Re-export Types
// ============================================
export type { Post, GetPostsRequest, CreatePostRequest, UpdatePostRequest }

// ============================================
// Posts API
// ============================================

/**
 * 포스트 목록 조회
 */
export async function getPosts(
  params?: GetPostsRequest
): Promise<PaginatedResponse<Post>> {
  const response = await api.get<PaginatedResponse<Post>>('/posts', { params })
  return response.data
}

/**
 * ID로 포스트 조회 (조회수 자동 증가)
 */
export async function getPostById(id: string): Promise<Post> {
  const response = await api.get<Post>(`/posts/${id}`)
  return response.data
}

/**
 * 포스트 생성 (로그인 필수)
 */
export async function createPost(data: CreatePostRequest): Promise<Post> {
  const response = await api.post<Post>('/posts', data)
  return response.data
}

/**
 * 포스트 수정 (작성자만)
 */
export async function updatePost(
  id: string,
  data: UpdatePostRequest
): Promise<Post> {
  const response = await api.put<Post>(`/posts/${id}`, data)
  return response.data
}

/**
 * 포스트 삭제 (작성자만)
 */
export async function deletePost(id: string): Promise<{ message: string }> {
  const response = await api.delete<{ message: string }>(`/posts/${id}`)
  return response.data
}
