'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import TechStackInput from '@/components/TechStackInput'
import { createClient } from '@/lib/supabase/client'
import api from '@/lib/api/client'
import ReactMarkdown from 'react-markdown'

export default function NewPostPage() {
  const router = useRouter()
  const { isAdmin, loading } = useAuth()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [preview, setPreview] = useState(false)
  const [authChecked, setAuthChecked] = useState(false)
  const [supabaseClient, setSupabaseClient] = useState<ReturnType<typeof createClient> | null>(null)

  const [formData, setFormData] = useState({
    title: '',
    summary: '',
    content: '',
    category: 'tutorial' as 'tutorial' | 'essay' | 'review' | 'news',
    tags: [] as string[]
  })

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const client = createClient()
      setSupabaseClient(client)
    }
  }, [])

  useEffect(() => {
    const checkAuthAndAdmin = async () => {
      if (loading || !supabaseClient) return
      
      try {
        const { data: { session }, error } = await supabaseClient.auth.getSession()
        
        if (error || !session) {
          alert('로그인이 필요합니다.')
          router.push('/login')
          return
        }

        if (!isAdmin) {
          alert('관리자만 접근할 수 있습니다.')
          router.push('/blog')
          return
        }

        setAuthChecked(true)
      } catch (err) {
        console.error('인증 체크 에러:', err)
        alert('인증 확인 중 오류가 발생했습니다.')
        router.push('/login')
      }
    }

    checkAuthAndAdmin()
  }, [loading, isAdmin, router, supabaseClient])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!formData.title || !formData.summary || !formData.content || !formData.category) {
      setError('필수 항목을 입력해주세요.')
      return
    }

    try {
      setSubmitting(true)

      const payload = {
        title: formData.title,
        summary: formData.summary,
        content: formData.content,
        category: formData.category,
        tags: formData.tags.length > 0 ? formData.tags : undefined
      }

      await api.post('/posts', payload)
      
      router.replace('/blog')
      setTimeout(() => alert('포스트가 작성되었습니다!'), 100)
    } catch (err: unknown) {
      console.error('포스트 작성 실패:', err)
      
      const error = err as { statusCode?: number; message?: string }
      if (error.statusCode === 401) {
        setError('로그인이 필요합니다.')
        setTimeout(() => router.push('/login'), 2000)
      } else if (error.statusCode === 403) {
        setError('권한이 없습니다.')
      } else {
        setError(error.message || '포스트 작성에 실패했습니다.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleCancel = () => {
    if (confirm('작성을 취소하시겠습니까? 입력한 내용이 사라집니다.')) {
      router.push('/blog')
    }
  }

  if (loading || !authChecked || !supabaseClient) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-800">
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              📝 포스트 작성
            </h1>
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

                {/* 카테고리 */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    카테고리 <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="tutorial">튜토리얼</option>
                    <option value="essay">에세이</option>
                    <option value="review">리뷰</option>
                    <option value="news">뉴스</option>
                  </select>
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
                    placeholder="# 제목

## 소제목

본문 내용...

```javascript
const example = 'code';
```

- 리스트 항목
- 또 다른 항목"
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
              disabled={submitting}
              className="flex-1 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? '작성 중...' : '작성하기'}
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
