import api from './client'

export interface Project {
  id: string
  title: string
  summary: string
  description: string
  thumbnail_url?: string
  demo_url?: string
  github_url?: string
  tech_stack: string[]
  tags: string[]
  status: 'in-progress' | 'completed' | 'archived'
  view_count: number
  like_count: number
  author_nickname: string
  created_at: string
  updated_at: string
}

export interface GetProjectsParams {
  page?: number
  limit?: number
  status?: string
  search?: string
  sortBy?: 'created_at' | 'view_count' | 'like_count'  // ✅ camelCase
  order?: 'ASC' | 'DESC'
}

export interface PaginatedProjects {
  data: Project[]
  total: number
  page: number
  limit: number
  total_pages: number
}

export async function getProjects(params?: GetProjectsParams): Promise<PaginatedProjects> {
  const response = await api.get('/projects', { params })
  return response.data
}

export async function getProject(id: string): Promise<Project> {
  const response = await api.get(`/projects/${id}`)
  return response.data
}
