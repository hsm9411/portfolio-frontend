'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import api from '@/lib/api/client'
import ReactMarkdown from 'react-markdown'

export default function NewPostPage() {
  const router = useRouter()
  const { user, isAdmin, loading } = useAuth()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [preview, setPreview] = useState(false)

  const [formData, setFormData] = useState({
    title: '',
    summary: '',
    content: '',
    tags: ''
  })

  useEffect(() => {
    if (!loading && !isAdmin) {
      alert('관리자만 접근할 수 있습니다.')
      router.push('/blog')
    }
  }, [loading, isAdmin, router])

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
        tags: formData.tags.split(',').map(s => s.trim()).filter(Boolean)
      }

      const response = await api.post('/posts', payload)
      
      alert('포스트가 작성되었습니다!')
      router.push(`/blog/${response.data.slug}`)
    } catch (err: any) {
      console.error('Failed to create post:', err)
      setError(err.response?.data?.message || '포스트 작성에 실패했습니다.')
    } finally {
      setSubmitting(false)
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
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              포스트 작성
            </h1>
            <button
              type="button"
              onClick={() => setPreview(!preview)}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700"
            >
              {preview ? '📝 편집' : '👁️ 미리보기'}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-4 text-sm text-red-600 dark:bg-red-900/30 dark:text-red-400">
            ❌ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {!preview ? (
            <div className="space-y-6">
              {/* 제목 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  제목 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 text-lg font-semibold focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  placeholder="포스트 제목"
                />
              </div>

              {/* 요약 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  요약 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.summary}
                  onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  placeholder="포스트 한 줄 소개"
                />
              </div>

              {/* 태그 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  태그 (쉼표로 구분)
                </label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  placeholder="NestJS, TypeScript, Backend"
                />
              </div>

              {/* Markdown 에디터 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  본문 (Markdown) <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={20}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 font-mono text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  placeholder="# 제목

## 소제목

본문 내용...

```javascript
코드 블록
```

- 리스트
- 항목"
                />
                <p className="mt-2 text-xs text-gray-500">
                  Markdown 문법을 사용하세요. 미리보기 버튼으로 확인할 수 있습니다.
                </p>
              </div>
            </div>
          ) : (
            /* 미리보기 */
            <div className="rounded-lg border border-gray-200 bg-white p-8 dark:border-gray-700 dark:bg-gray-800">
              <h1 className="mb-4 text-4xl font-bold text-gray-900 dark:text-white">
                {formData.title || '제목 없음'}
              </h1>
              <p className="mb-6 text-lg text-gray-600 dark:text-gray-400">
                {formData.summary || '요약 없음'}
              </p>
              {formData.tags && (
                <div className="mb-6 flex flex-wrap gap-2">
                  {formData.tags.split(',').map((tag, i) => (
                    <span
                      key={i}
                      className="rounded-lg bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                    >
                      #{tag.trim()}
                    </span>
                  ))}
                </div>
              )}
              <article className="prose prose-lg max-w-none dark:prose-invert">
                <ReactMarkdown>{formData.content || '*내용 없음*'}</ReactMarkdown>
              </article>
            </div>
          )}

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
              onClick={() => router.back()}
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
