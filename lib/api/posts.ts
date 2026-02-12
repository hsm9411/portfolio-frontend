import api from './client'

export interface Post {
  id: string
  slug: string
  title: string
  content: string
  summary: string
  tags: string[]
  readTimeMinutes: number
  viewCount: number
  likeCount: number
  authorId: string
  authorNickname: string
  authorAvatarUrl?: string
  createdAt: string
  updatedAt: string
}

export interface GetPostsParams {
  page?: number
  limit?: number
  search?: string
  tags?: string[]
}

export interface PaginatedPosts {
  items: Post[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export async function getPosts(params?: GetPostsParams): Promise<PaginatedPosts> {
  const response = await api.get('/posts', { params })
  return response.data
}

export async function getPostBySlug(slug: string): Promise<Post> {
  const response = await api.get(`/posts/${slug}`)
  return response.data
}

export async function createPost(data: {
  title: string
  content: string
  summary: string
  tags: string[]
}): Promise<Post> {
  const response = await api.post('/posts', data)
  return response.data
}

export async function updatePost(id: string, data: Partial<{
  title: string
  content: string
  summary: string
  tags: string[]
}>): Promise<Post> {
  const response = await api.put(`/posts/${id}`, data)
  return response.data
}

export async function deletePost(id: string): Promise<{ message: string }> {
  const response = await api.delete(`/posts/${id}`)
  return response.data
}
