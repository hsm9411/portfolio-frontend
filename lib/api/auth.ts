import api from './client'

export interface User {
  id: string
  email: string
  nickname: string
  avatarUrl?: string
  isAdmin: boolean
}

export interface LoginResponse {
  access_token: string
  user: User
}

export async function register(data: {
  email: string
  password: string
  nickname: string
}): Promise<LoginResponse> {
  const response = await api.post('/auth/register', data)
  return response.data
}

export async function login(data: {
  email: string
  password: string
}): Promise<LoginResponse> {
  const response = await api.post('/auth/login', data)
  return response.data
}

export async function getMe(): Promise<User> {
  const response = await api.get('/auth/me')
  return response.data
}
