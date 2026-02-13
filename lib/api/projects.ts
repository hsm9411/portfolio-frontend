import api from './client'
import type {
  Project,
  GetProjectsRequest,
  PaginatedResponse,
  CreateProjectRequest,
  UpdateProjectRequest,
} from '@/lib/types/api'

// ============================================
// Projects API
// ============================================

/**
 * 프로젝트 목록 조회
 */
export async function getProjects(
  params?: GetProjectsRequest
): Promise<PaginatedResponse<Project>> {
  const response = await api.get<PaginatedResponse<Project>>('/projects', { params })
  return response.data
}

/**
 * 프로젝트 상세 조회 (조회수 자동 증가)
 */
export async function getProject(id: string): Promise<Project> {
  const response = await api.get<Project>(`/projects/${id}`)
  return response.data
}

/**
 * 프로젝트 생성 (관리자만)
 */
export async function createProject(data: CreateProjectRequest): Promise<Project> {
  const response = await api.post<Project>('/projects', data)
  return response.data
}

/**
 * 프로젝트 수정 (작성자/관리자)
 */
export async function updateProject(
  id: string,
  data: UpdateProjectRequest
): Promise<Project> {
  const response = await api.patch<Project>(`/projects/${id}`, data)
  return response.data
}

/**
 * 프로젝트 삭제 (작성자/관리자)
 */
export async function deleteProject(id: string): Promise<{ message: string }> {
  const response = await api.delete<{ message: string }>(`/projects/${id}`)
  return response.data
}
