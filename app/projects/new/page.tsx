'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import TechStackInput from '@/components/TechStackInput'
import api from '@/lib/api/client'

export default function NewProjectPage() {
  const router = useRouter()
  const { user, isAdmin, loading } = useAuth()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    title: '',
    summary: '',
    description: '',
    thumbnailUrl: '',
    demoUrl: '',
    githubUrl: '',
    techStack: [] as string[],
    tags: [] as string[],
    status: 'in-progress' as 'in-progress' | 'completed' | 'archived'
  })

  useEffect(() => {
    if (!loading && !isAdmin) {
      alert('관리자만 접근할 수 있습니다.')
      router.push('/projects')
    }
  }, [loading, isAdmin, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!formData.title || !formData.summary || !formData.description) {
      setError('필수 항목을 입력해주세요.')
      return
    }

    if (formData.techStack.length === 0) {
      setError('최소 1개의 기술 스택을 선택해주세요.')
      return
    }

    try {
      setSubmitting(true)

      const payload: Record<string, any> = {
        title: formData.title,
        summary: formData.summary,
        description: formData.description,
        status: formData.status,
        techStack: formData.techStack,
      }

      if (formData.thumbnailUrl) payload.thumbnailUrl = formData.thumbnailUrl
      if (formData.demoUrl) payload.demoUrl = formData.demoUrl
      if (formData.githubUrl) payload.githubUrl = formData.githubUrl
      if (formData.tags.length > 0) payload.tags = formData.tags

      await api.post('/projects', payload)
      
      // ✅ replace 사용: 히스토리 대체 (뒤로가기 시 작성 페이지로 안 감)
      router.replace('/projects')
      setTimeout(() => alert('프로젝트가 작성되었습니다!'), 100)
    } catch (err: unknown) {
      console.error('프로젝트 작성 실패:', err)
      
      const error = err as { statusCode?: number; message?: string | string[] }
      if (error.statusCode === 401) {
        setError('로그인이 필요합니다.')
        setTimeout(() => router.push('/login'), 2000)
      } else if (error.statusCode === 403) {
        setError('권한이 없습니다.')
      } else {
        const errorMessage = Array.isArray(error.message) 
          ? error.message.join(', ') 
          : error.message || '프로젝트 작성에 실패했습니다.'
        setError(errorMessage)
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleCancel = () => {
    if (confirm('작성을 취소하시겠습니까? 입력한 내용이 사라집니다.')) {
      router.push('/projects')
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
      </div>
    )
  }

  if (!isAdmin) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            프로젝트 작성
          </h1>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-4 text-sm text-red-600 dark:bg-red-900/30 dark:text-red-400">
            ❌ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
            {/* 제목 */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                제목 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                placeholder="프로젝트 제목"
              />
            </div>

            {/* 요약 */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                요약 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.summary}
                onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                placeholder="프로젝트 한 줄 소개"
              />
            </div>

            {/* 상세 설명 */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                상세 설명 <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={10}
                className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                placeholder="프로젝트 상세 설명"
              />
            </div>

            {/* 기술 스택 */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                기술 스택 <span className="text-red-500">*</span>
              </label>
              <div className="mt-1">
                <TechStackInput
                  value={formData.techStack}
                  onChange={(value) => setFormData({ ...formData, techStack: value })}
                />
              </div>
            </div>

            {/* 태그 */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                태그
              </label>
              <div className="mt-1">
                <TechStackInput
                  value={formData.tags}
                  onChange={(value) => setFormData({ ...formData, tags: value })}
                />
              </div>
            </div>

            {/* 썸네일 URL */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                썸네일 URL
              </label>
              <input
                type="url"
                value={formData.thumbnailUrl}
                onChange={(e) => setFormData({ ...formData, thumbnailUrl: e.target.value })}
                className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                placeholder="https://example.com/image.png"
              />
            </div>

            {/* 데모 URL */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                데모 URL
              </label>
              <input
                type="url"
                value={formData.demoUrl}
                onChange={(e) => setFormData({ ...formData, demoUrl: e.target.value })}
                className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                placeholder="https://demo.example.com"
              />
            </div>

            {/* GitHub URL */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                GitHub URL
              </label>
              <input
                type="url"
                value={formData.githubUrl}
                onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                placeholder="https://github.com/username/repo"
              />
            </div>

            {/* 상태 */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                상태
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
                <option value="in-progress">진행중</option>
                <option value="completed">완료</option>
                <option value="archived">보관</option>
              </select>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 rounded-lg bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? '작성 중...' : '작성하기'}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="rounded-lg border border-gray-300 px-6 py-3 font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              취소
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}
