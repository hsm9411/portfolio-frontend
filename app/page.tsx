'use client'

import { useEffect, useState } from 'react'
import { getProjects, type Project } from '@/lib/api/projects'
import ProjectCard from '@/components/ProjectCard'
import AuthButton from '@/components/AuthButton'
import api from '@/lib/api/client'

export default function Home() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [backendStatus, setBackendStatus] = useState<'checking' | 'connected' | 'error'>('checking')
  const [backendError, setBackendError] = useState<string | null>(null)

  // 백엔드 연결 테스트
  useEffect(() => {
    async function checkBackend() {
      try {
        setBackendStatus('checking')
        setBackendError(null)
        
        // Health check 엔드포인트 호출
        const response = await api.get('/health')
        console.log('Backend health check:', response.data)
        setBackendStatus('connected')
      } catch (err: any) {
        console.error('Backend health check failed:', err)
        setBackendStatus('error')
        setBackendError(err.response?.data?.message || err.message || 'Connection failed')
      }
    }

    checkBackend()
  }, [])

  // Projects 불러오기
  useEffect(() => {
    async function fetchProjects() {
      try {
        setLoading(true)
        setError(null)
        const response = await getProjects({ limit: 6, sort_by: 'created_at', order: 'DESC' })
        setProjects(response.data)
      } catch (err: any) {
        console.error('Failed to fetch projects:', err)
        setError(err.response?.data?.message || err.message || 'Failed to load projects')
      } finally {
        setLoading(false)
      }
    }

    if (backendStatus === 'connected') {
      fetchProjects()
    }
  }, [backendStatus])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Portfolio Backend Test
              </h1>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                백엔드 API 및 Supabase 연결 테스트
              </p>
            </div>
            <AuthButton />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Connection Status */}
        <div className="mb-8 rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">
            🔌 연결 상태
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {/* Backend API */}
            <div className="rounded-md bg-gray-50 p-4 dark:bg-gray-700">
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Backend API
              </div>
              <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {typeof window !== 'undefined' && window.location.protocol === 'https:'
                  ? '/api (Vercel Proxy)'
                  : 'http://158.180.75.205:3001'}
              </div>
              <div className="mt-2">
                {backendStatus === 'checking' ? (
                  <span className="text-yellow-600">⏳ 연결 중...</span>
                ) : backendStatus === 'error' ? (
                  <div>
                    <span className="text-red-600">❌ 연결 실패</span>
                    {backendError && (
                      <p className="mt-1 text-xs text-red-500">{backendError}</p>
                    )}
                  </div>
                ) : (
                  <span className="text-green-600">✅ 연결 성공</span>
                )}
              </div>
            </div>

            {/* Supabase */}
            <div className="rounded-md bg-gray-50 p-4 dark:bg-gray-700">
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Supabase Auth
              </div>
              <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {process.env.NEXT_PUBLIC_SUPABASE_URL}
              </div>
              <div className="mt-2">
                <span className="text-green-600">✅ 설정 완료</span>
              </div>
            </div>
          </div>

          {/* Debug Info */}
          <div className="mt-4 rounded-md bg-blue-50 p-3 dark:bg-blue-900/20">
            <details className="text-xs">
              <summary className="cursor-pointer font-medium text-blue-900 dark:text-blue-300">
                🔍 디버그 정보
              </summary>
              <div className="mt-2 space-y-1 text-blue-800 dark:text-blue-400">
                <div>Protocol: {typeof window !== 'undefined' ? window.location.protocol : 'SSR'}</div>
                <div>Host: {typeof window !== 'undefined' ? window.location.host : 'SSR'}</div>
                <div>API Base: {typeof window !== 'undefined' && window.location.protocol === 'https:' ? '/api' : 'http://158.180.75.205:3001'}</div>
                <div>Environment: {process.env.NODE_ENV}</div>
              </div>
            </details>
          </div>
        </div>

        {/* Projects Section */}
        <div>
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              📁 Projects
            </h2>
            <span className="text-sm text-gray-500">
              총 {projects.length}개
            </span>
          </div>

          {backendStatus === 'checking' ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center text-gray-500">
                <div className="mx-auto mb-2 h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
                <p className="text-sm">백엔드 연결 확인 중...</p>
              </div>
            </div>
          ) : backendStatus === 'error' ? (
            <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
              <p className="text-red-600">❌ 백엔드 서버 연결 실패</p>
              <p className="mt-2 text-sm text-red-500">
                백엔드 서버가 실행 중인지 확인해주세요.
              </p>
              {backendError && (
                <p className="mt-2 text-xs text-red-400">{backendError}</p>
              )}
            </div>
          ) : loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center text-gray-500">
                <div className="mx-auto mb-2 h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
                <p className="text-sm">Loading projects...</p>
              </div>
            </div>
          ) : error ? (
            <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
              <p className="text-red-600">❌ {error}</p>
            </div>
          ) : projects.length === 0 ? (
            <div className="rounded-lg border border-gray-200 bg-white p-12 text-center dark:border-gray-700 dark:bg-gray-800">
              <p className="text-gray-500">프로젝트가 없습니다.</p>
              <p className="mt-2 text-sm text-gray-400">
                백엔드 DB에 프로젝트 데이터를 추가해주세요.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {projects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white py-8 dark:border-gray-700 dark:bg-gray-800">
        <div className="mx-auto max-w-7xl px-4 text-center text-sm text-gray-500 sm:px-6 lg:px-8">
          <p>포트폴리오 백엔드 연동 테스트 페이지</p>
          <p className="mt-1">NestJS + Supabase + Redis</p>
        </div>
      </footer>
    </div>
  )
}
