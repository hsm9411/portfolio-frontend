import api from './client'

export interface ToggleLikeResponse {
  liked: boolean
  likeCount: number
}

export interface CheckLikeResponse {
  liked: boolean
}

export async function toggleLike(
  targetType: 'project' | 'post',
  targetId: string
): Promise<ToggleLikeResponse> {
  const response = await api.post('/likes/toggle', { targetType, targetId })
  return response.data
}

export async function checkLike(
  targetType: 'project' | 'post',
  targetId: string
): Promise<CheckLikeResponse> {
  const response = await api.get('/likes/check', {
    params: { targetType, targetId }
  })
  return response.data
}
