import api from './client'
import type {
  ProjectUpdate,
  CreateProjectUpdateRequest,
  UpdateProjectUpdateRequest,
} from '@/lib/types/api'

export type { ProjectUpdate }

export async function getUpdates(projectId: string): Promise<ProjectUpdate[]> {
  const res = await api.get<ProjectUpdate[]>(`/projects/${projectId}/updates`)
  return res.data
}

export async function createUpdate(
  projectId: string,
  data: CreateProjectUpdateRequest
): Promise<ProjectUpdate> {
  const res = await api.post<ProjectUpdate>(`/projects/${projectId}/updates`, data)
  return res.data
}

export async function updateUpdate(
  updateId: string,
  data: UpdateProjectUpdateRequest
): Promise<ProjectUpdate> {
  const res = await api.patch<ProjectUpdate>(`/projects/updates/${updateId}`, data)
  return res.data
}

export async function deleteUpdate(updateId: string): Promise<void> {
  await api.delete(`/projects/updates/${updateId}`)
}
