'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { getPostBySlug } from '@/lib/api/posts'
import TechStackInput from '@/components/TechStackInput'
import api from '@/lib/api/client'
import ReactMarkdown from 'react-markdown'

export default function EditPostPage() {
  const params = useParams()
  const router = useRouter()
  const { isAdmin, loading: authLoading } = useAuth()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [preview, setPreview] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  const [formData, setFormData] = useState({
    title: '',
    summary: '',
    content: '',
    tags: [] as string[]
  })

  const [originalData, setOriginalData] = useState(formData)

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      alert('관리자만 접근할 수 있습니다.')
      router.push('/blog')
      return
    }

    if (params.slug && isAdmin) {
      loadPost(params.slug as string)
    }
  }, [params.slug, isAdmin, authLoading, router])

  useEffect(() => {
    const changed = JSON.stringify(formData) !== JSON.stringify(originalData)
    setHasChanges(changed)
  }, [formData, originalData])

  const loadPost = async (slug: string) => {
    try {
      setLoading(true)
      const post = await getPostBySlug(slug)
      
      const data = {
        title: post.title,
        summary: post.summary,
        content: post.content,
        tags: post.tags || []
      }
      
      setFormData(data)
      setOriginalData(data)
    } catch (error: unknown) {
      console.error('Failed to load post:', error)
      alert('포스트를 불러오는데 실패했습니다.')
      router.push('/blog')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!formData.title || !formData.summary || !formData.content) {
      setError('필수 항목을 입력해주세요.')
      return
    }

    try {
      setSubmitting(true)

      const payload = {
        title: formData.title,
        summary: formData.summary,
        content: formData.content,
        tags: formData.tags.length > 0 ? formData.tags : undefined
      }

      await api.patch(`/posts/${params.slug}`, payload)
      
      router.replace(`/blog/${params.slug}`)
      setTimeout(() => alert('포스트가 수정되었습니다!'), 100)
    } catch (err: unknown) {
      console.error('Failed to update post:', err)
      const error = err as { statusCode?: number; message?: string | string[] }
      
      const errorMessage = Array.isArray(error.message) 
        ? error.message.join(', ') 
        : error.message || '포스트 수정에 실패했습니다.'
      setError(errorMessage)
    } finally {
      setSubmitting(false)
    }
  }

  const handleCancel = () => {
    if (hasChanges) {
      if (confirm('변경사항이 저장되지 않았습니다. 취소하시겠습니까?')) {
        router.push(`/blog/${params.slug}`)
      }
    } else {
      router.push(`/blog/${params.slug}`)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
      </div>
    )
  }

  if (!isAdmin) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-800">
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                📝 포스트 수정
              </h1>
              {hasChanges && (
                <p className="mt-1 text-sm text-orange-600 dark:text-orange-400">
                  ⚠️ 저장되지 않은 변경사항이 있습니다
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={() => setPreview(!preview)}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            >
              {preview ? '📝 편집 모드' : '👁️ 미리보기'}
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-600 dark:bg-red-900/30 dark:text-red-400">
            ❌ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {!preview ? (
            <div className="space-y-6">
              {/* Card Container */}
              <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                {/* 제목 */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    제목 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-3 text-lg font-semibold focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    placeholder="포스트 제목"
                  />
                </div>

                {/* 요약 */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    요약 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.summary}
                    onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    placeholder="포스트 한 줄 소개"
                  />
                </div>

                {/* 태그 */}
                <div className="mb-6">
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

                {/* Markdown 에디터 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    본문 (Markdown) <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    rows={24}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-3 font-mono text-sm leading-relaxed focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    placeholder="Markdown 내용..."
                  />
                  <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    Markdown 문법을 사용하세요. 미리보기로 렌더링을 확인할 수 있습니다.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            /* 미리보기 */
            <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <h1 className="mb-4 text-4xl font-bold text-gray-900 dark:text-white">
                {formData.title || '제목 없음'}
              </h1>
              <p className="mb-6 text-lg text-gray-600 dark:text-gray-400">
                {formData.summary || '요약 없음'}
              </p>
              {formData.tags.length > 0 && (
                <div className="mb-8 flex flex-wrap gap-2">
                  {formData.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-lg bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 ring-1 ring-blue-600/20 dark:bg-blue-900/30 dark:text-blue-300 dark:ring-blue-500/30"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
              <article className="prose prose-lg max-w-none dark:prose-invert">
                <ReactMarkdown>{formData.content || '*내용 없음*'}</ReactMarkdown>
              </article>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={submitting || !hasChanges}
              className="flex-1 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? '수정 중...' : hasChanges ? '수정하기' : '변경사항 없음'}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="rounded-lg border border-gray-300 bg-white px-6 py-3 font-semibold text-gray-700 shadow-sm transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            >
              취소
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}
