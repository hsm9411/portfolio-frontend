'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useUnsavedWarning } from '@/hooks/useUnsavedWarning'
import TechStackInput from '@/components/TechStackInput'
import ThumbnailUploader from '@/components/ThumbnailUploader'
import api from '@/lib/api/client'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

const EMPTY_FORM = {
  title: '',
  summary: '',
  content: '',
  thumbnailUrl: '',
  category: 'tutorial' as 'tutorial' | 'essay' | 'review' | 'news',
  tags: [] as string[],
}

export default function NewPostPage() {
  const router = useRouter()
  const { isAdmin, authReady } = useAuth()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [preview, setPreview] = useState(false)
  const [formData, setFormData] = useState(EMPTY_FORM)

  const hasChanges = JSON.stringify(formData) !== JSON.stringify(EMPTY_FORM)
  useUnsavedWarning(hasChanges)

  useEffect(() => {
    if (authReady && !isAdmin) router.replace('/blog')
  }, [authReady, isAdmin, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!formData.title || !formData.summary || !formData.content) {
      setError('필수 항목(제목·요약·본문)을 입력해주세요.')
      return
    }
    try {
      setSubmitting(true)
      await api.post('/posts', {
        title: formData.title,
        summary: formData.summary,
        content: formData.content,
        category: formData.category,
        tags: formData.tags.length > 0 ? formData.tags : undefined,
        ...(formData.thumbnailUrl ? { thumbnailUrl: formData.thumbnailUrl } : {}),
      })
      router.replace('/blog')
    } catch (err: unknown) {
      const e = err as { statusCode?: number; message?: string }
      if (e.statusCode === 401) {
        setError('로그인이 필요합니다.')
        setTimeout(() => router.push('/login'), 1500)
      } else if (e.statusCode === 403) {
        setError('관리자 권한이 필요합니다.')
      } else {
        setError(e.message || '포스트 작성에 실패했습니다.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleCancel = () => {
    if (hasChanges && !confirm('작성을 취소할까요? 입력한 내용이 사라집니다.')) return
    router.back()
  }

  if (!authReady || !isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-gray-200 border-t-blue-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">

      {/* Sticky 액션 바 — navbar 바로 아래 */}
      <div className="sticky top-[72px] z-40 border-b border-gray-200 bg-white/90 backdrop-blur-md dark:border-gray-800 dark:bg-gray-900/90">
        <div className="mx-auto flex max-w-[1000px] items-center justify-between px-5 py-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleCancel}
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-800 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              취소
            </button>
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">포스트 작성</span>
          </div>

          <div className="flex items-center gap-2">
            {/* 편집 / 미리보기 토글 */}
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
              form="new-post-form"
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  저장 중...
                </>
              ) : '작성하기'}
            </button>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-[1000px] px-5 py-8">
        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-lg border border-red-100 bg-red-50 p-4 text-sm text-red-600 dark:border-red-900/30 dark:bg-red-900/20 dark:text-red-400">
            <svg className="mt-0.5 h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        )}

        {!preview ? (
          <form id="new-post-form" onSubmit={handleSubmit}>
            <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800 sm:p-8">

              <Field label="제목" required>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="포스트 제목"
                  className={`${inputClass} text-base font-semibold`}
                />
              </Field>

              <Field label="요약" required>
                <input
                  type="text"
                  value={formData.summary}
                  onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                  placeholder="한 줄 소개"
                  className={inputClass}
                />
              </Field>

              <Field label="썸네일 이미지">
                <ThumbnailUploader
                  value={formData.thumbnailUrl}
                  onChange={(url) => setFormData({ ...formData, thumbnailUrl: url })}
                />
              </Field>

              <div className="mb-5 grid gap-5 sm:grid-cols-2">
                <Field label="카테고리" required>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className={inputClass}
                  >
                    <option value="tutorial">튜토리얼</option>
                    <option value="essay">에세이</option>
                    <option value="review">리뷰</option>
                    <option value="news">뉴스</option>
                  </select>
                </Field>
                <Field label="태그">
                  <TechStackInput
                    value={formData.tags}
                    onChange={(v) => setFormData({ ...formData, tags: v })}
                  />
                </Field>
              </div>

              <Field label="본문 (Markdown)" required>
                <textarea
                  value={formData.content}
                  rows={28}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder={`# 제목\n\n## 소제목\n\n본문 내용...\n\n\`\`\`javascript\nconst example = 'code';\n\`\`\``}
                  className={`${inputClass} font-mono text-sm leading-relaxed`}
                />
                <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">
                  Markdown 문법을 지원합니다. 미리보기 탭에서 렌더링을 확인하세요.
                </p>
              </Field>
            </div>
          </form>
        ) : (
          <div className="rounded-xl border border-gray-200 bg-white p-8 dark:border-gray-700 dark:bg-gray-800 sm:p-12">
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
            <p className="mb-8 text-base text-gray-500 dark:text-gray-400">
              {formData.summary || '요약 없음'}
            </p>
            <div className="markdown-body">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{formData.content || '*내용 없음*'}</ReactMarkdown>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="mb-5">
      <label className="mb-1.5 block text-sm font-medium text-gray-600 dark:text-gray-400">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  )
}

const inputClass = 'w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 transition-colors focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500 dark:focus:border-blue-500 dark:focus:bg-gray-800/80'
