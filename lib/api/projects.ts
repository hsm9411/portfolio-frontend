import api from './client'

export interface Project {
  id: string
  title: string
  summary: string
  description: string
  thumbnailUrl?: string      // ✅ camelCase
  demoUrl?: string           // ✅ camelCase
  githubUrl?: string         // ✅ camelCase
  techStack: string[]        // ✅ camelCase
  tags: string[]
  status: 'in-progress' | 'completed' | 'archived'
  viewCount: number          // ✅ camelCase
  likeCount: number          // ✅ camelCase
  authorId: string           // ✅ camelCase
  authorNickname: string     // ✅ camelCase
  authorAvatarUrl?: string   // ✅ camelCase
  createdAt: string          // ✅ camelCase
  updatedAt: string          // ✅ camelCase
}

export interface GetProjectsParams {
  page?: number
  limit?: number
  status?: string
  search?: string
  sortBy?: 'created_at' | 'view_count' | 'like_count'
  order?: 'ASC' | 'DESC'
}

export interface PaginatedProjects {
  items: Project[]           // ✅ items (not data!)
  total: number
  page: number
  pageSize: number           // ✅ pageSize (not limit!)
  totalPages: number         // ✅ totalPages (not total_pages!)
}

export async function getProjects(params?: GetProjectsParams): Promise<PaginatedProjects> {
  const response = await api.get('/projects', { params })
  return response.data
}

export async function getProject(id: string): Promise<Project> {
  const response = await api.get(`/projects/${id}`)
  return response.data
}
