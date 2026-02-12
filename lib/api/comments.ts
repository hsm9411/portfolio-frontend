import api from './client'

export interface Comment {
  id: string
  targetType: 'project' | 'post'
  targetId: string
  parentId?: string
  content: string
  isAnonymous: boolean
  authorId?: string
  authorNickname: string
  authorEmail?: string
  createdAt: string
  updatedAt: string
  replies?: Comment[]  // 대댓글
}

export interface GetCommentsParams {
  targetType: 'project' | 'post'
  targetId: string
  page?: number
  limit?: number
}

export interface PaginatedComments {
  items: Comment[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export async function getComments(params: GetCommentsParams): Promise<PaginatedComments> {
  const response = await api.get('/comments', { params })
  return response.data
}

export async function createComment(data: {
  targetType: 'project' | 'post'
  targetId: string
  content: string
  parentId?: string
  isAnonymous?: boolean
}): Promise<Comment> {
  const response = await api.post('/comments', data)
  return response.data
}

export async function updateComment(id: string, content: string): Promise<Comment> {
  const response = await api.patch(`/comments/${id}`, { content })
  return response.data
}

export async function deleteComment(id: string): Promise<{ message: string }> {
  const response = await api.delete(`/comments/${id}`)
  return response.data
}
