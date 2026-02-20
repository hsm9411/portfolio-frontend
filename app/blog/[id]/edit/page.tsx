'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useUnsavedWarning } from '@/hooks/useUnsavedWarning'
import { getPostById } from '@/lib/api/posts'
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
  const [postId, setPostId] = useState('')

  const [formData, setFormData] = useState({
    title: '',
    summary: '',
    content: '',
    category: 'tutorial' as 'tutorial' | 'essay' | 'review' | 'news',
    tags: [] as string[],
  })
  const [originalData, setOriginalData] = useState(formData)
  const hasChanges = JSON.stringify(formData) !== JSON.stringify(originalData)

  useUnsavedWarning(hasChanges)

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      router.replace('/blog')
      return
    }
    if (params.id && isAdmin) loadPost(params.id as string)
  }, [params.id, isAdmin, authLoading])

  const loadPost = async (id: string) => {
    try {
      setLoading(true)
      const post = await getPostById(id)
      const data = {
        title: post.title,
        summary: post.summary,
        content: post.content,
        category: post.category as 'tutorial' | 'essay' | 'review' | 'news',
        tags: post.tags || [],
      }
      setPostId(post.id)
      setFormData(data)
      setOriginalData(data)
    } catch {
      router.push('/blog')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!formData.title || !formData.summary || !formData.content) {
      setError('필수 항목(제목·요약·본문)을 입력해주세요.')
      return
    }
    try {
      setSubmitting(true)
      await api.put(`/posts/${postId}`, {
        title: formData.title,
        summary: formData.summary,
        content: formData.content,
        category: formData.category,
        tags: formData.tags.length > 0 ? formData.tags : undefined,
      })
      router.replace(`/blog/${postId}`)
    } catch (err: unknown) {
      const e = err as { message?: string | string[] }
      setError(Array.isArray(e.message) ? e.message.join(', ') : e.message || '수정에 실패했습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleCancel = () => {
    if (hasChanges && !confirm('변경사항이 저장되지 않았습니다. 취소할까요?')) return
    router.push(`/blog/${postId}`)
  }

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
      </div>
    )
  }

  if (!isAdmin) return null

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">

      {/* ── Sticky 저장 바 ── */}
      <div className="sticky top-16 z-40 border-b border-gray-200/80 bg-white/90 backdrop-blur-md dark:border-gray-800/80 dark:bg-gray-900/90">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          {/* 왼쪽: 취소 + 제목 + 변경사항 표시 */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleCancel}
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              취소
            </button>
            <div>
              <span className="text-base font-semibold text-gray-900 dark:text-white">포스트 수정</span>
              {hasChanges && (
                <span className="ml-2 text-xs text-amber-600 dark:text-amber-400">● 저장되지 않은 변경사항</span>
              )}
            </div>
          </div>

          {/* 오른쪽: 편집/미리보기 탭 + 저장 */}
          <div className="flex items-center gap-2">
            <div className="flex rounded-lg border border-gray-200 bg-gray-100 p-0.5 dark:border-gray-700 dark:bg-gray-800">
              <button
                type="button"
                onClick={() => setPreview(false)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  !preview
                    ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-white'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                }`}
              >
                편집
              </button>
              <button
                type="button"
                onClick={() => setPreview(true)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  preview
                    ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-white'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                }`}
              >
                미리보기
              </button>
            </div>
            <button
              form="edit-post-form"
              type="submit"
              disabled={submitting || !hasChanges}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  저장 중...
                </>
              ) : hasChanges ? '저장하기' : '변경사항 없음'}
            </button>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-xl bg-red-50 p-4 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
            <svg className="mt-0.5 h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        )}

        {!preview ? (
          <form id="edit-post-form" onSubmit={handleSubmit}>
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800 sm:p-8">

              <Field label="제목" required>
                <input type="text" value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="포스트 제목" className={`${inputClass} text-lg font-semibold`} />
              </Field>

              <Field label="요약" required>
                <input type="text" value={formData.summary}
                  onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                  placeholder="한 줄 소개" className={inputClass} />
              </Field>

              <div className="mb-5 grid gap-5 sm:grid-cols-2">
                <Field label="카테고리" required>
                  <select value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className={inputClass}>
                    <option value="tutorial">튜토리얼</option>
                    <option value="essay">에세이</option>
                    <option value="review">리뷰</option>
                    <option value="news">뉴스</option>
                  </select>
                </Field>
                <Field label="태그">
                  <TechStackInput value={formData.tags} onChange={(v) => setFormData({ ...formData, tags: v })} />
                </Field>
              </div>

              <Field label="본문 (Markdown)" required>
                <textarea value={formData.content} rows={24}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Markdown 내용..." className={`${inputClass} font-mono text-sm leading-relaxed`} />
                <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">
                  Markdown 문법을 사용하세요. 상단 미리보기 탭에서 렌더링을 확인할 수 있습니다.
                </p>
              </Field>
            </div>
          </form>
        ) : (
          /* 미리보기 */
          <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-700 dark:bg-gray-800 sm:p-12">
            {formData.tags.length > 0 && (
              <div className="mb-5 flex flex-wrap gap-2">
                {formData.tags.map((tag) => (
                  <span key={tag} className="rounded-md bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 ring-1 ring-blue-600/20 dark:bg-blue-900/30 dark:text-blue-300">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
            <h1 className="mb-3 text-3xl font-bold text-gray-900 dark:text-white">
              {formData.title || '제목 없음'}
            </h1>
            <p className="mb-8 text-lg text-gray-600 dark:text-gray-400">
              {formData.summary || '요약 없음'}
            </p>
            <article className="prose prose-lg max-w-none dark:prose-invert">
              <ReactMarkdown>{formData.content || '*내용 없음*'}</ReactMarkdown>
            </article>
          </div>
        )}
      </main>
    </div>
  )
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="mb-5">
      <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  )
}

const inputClass = 'w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:focus:border-blue-500 dark:focus:bg-gray-800'
