'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useUnsavedWarning } from '@/hooks/useUnsavedWarning'
import TechStackInput from '@/components/TechStackInput'
import ThumbnailUploader from '@/components/ThumbnailUploader'
import api from '@/lib/api/client'

const EMPTY_FORM = {
  title: '',
  summary: '',
  description: '',
  thumbnailUrl: '',
  demoUrl: '',
  githubUrl: '',
  techStack: [] as string[],
  tags: [] as string[],
  status: 'in-progress' as 'in-progress' | 'completed' | 'archived',
}

export default function NewProjectPage() {
  const router = useRouter()
  const { isAdmin, loading } = useAuth()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState(EMPTY_FORM)

  const hasChanges = JSON.stringify(formData) !== JSON.stringify(EMPTY_FORM)
  useUnsavedWarning(hasChanges)

  useEffect(() => {
    if (!loading && !isAdmin) {
      router.replace('/projects')
    }
  }, [loading, isAdmin, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!formData.title || !formData.summary || !formData.description) {
      setError('필수 항목(제목·요약·설명)을 입력해주세요.')
      return
    }
    if (formData.techStack.length === 0) {
      setError('최소 1개의 기술 스택을 입력해주세요.')
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
      router.replace('/projects')
    } catch (err: unknown) {
      const e = err as { statusCode?: number; message?: string | string[] }
      setError(
        Array.isArray(e.message) ? e.message.join(', ') : e.message || '작성에 실패했습니다.'
      )
    } finally {
      setSubmitting(false)
    }
  }

  const handleCancel = () => {
    if (hasChanges && !confirm('작성을 취소할까요? 입력한 내용이 사라집니다.')) return
    router.back()
  }

  if (loading || !isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">

      {/* ── Sticky 저장 바 ── */}
      <div className="sticky top-16 z-40 border-b border-gray-200/80 bg-white/90 backdrop-blur-md dark:border-gray-800/80 dark:bg-gray-900/90">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
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
            <span className="text-base font-semibold text-gray-900 dark:text-white">프로젝트 작성</span>
          </div>
          <button
            form="project-form"
            type="submit"
            disabled={submitting}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 disabled:opacity-50"
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

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-xl bg-red-50 p-4 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
            <svg className="mt-0.5 h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            {error}
          </div>
        )}

        <form id="project-form" onSubmit={handleSubmit} className="space-y-5">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800 sm:p-8">

            <Field label="제목" required>
              <input type="text" value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="프로젝트 제목" className={inputClass} />
            </Field>

            <Field label="요약" required>
              <input type="text" value={formData.summary}
                onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                placeholder="한 줄 소개" className={inputClass} />
            </Field>

            <Field label="상세 설명" required>
              <textarea value={formData.description} rows={10}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="프로젝트 상세 설명" className={inputClass} />
            </Field>

            <Field label="기술 스택" required>
              <TechStackInput value={formData.techStack} onChange={(v) => setFormData({ ...formData, techStack: v })} />
            </Field>

            <Field label="태그">
              <TechStackInput value={formData.tags} onChange={(v) => setFormData({ ...formData, tags: v })} />
            </Field>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="썸네일 이미지">
                <ThumbnailUploader
                  value={formData.thumbnailUrl}
                  onChange={(url) => setFormData({ ...formData, thumbnailUrl: url })}
                />
              </Field>
              <Field label="데모 URL">
                <input type="url" value={formData.demoUrl}
                  onChange={(e) => setFormData({ ...formData, demoUrl: e.target.value })}
                  placeholder="https://demo.example.com" className={inputClass} />
              </Field>
              <Field label="GitHub URL">
                <input type="url" value={formData.githubUrl}
                  onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                  placeholder="https://github.com/username/repo" className={inputClass} />
              </Field>
              <Field label="상태">
                <select value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className={inputClass}>
                  <option value="in-progress">진행중</option>
                  <option value="completed">완료</option>
                  <option value="archived">보관</option>
                </select>
              </Field>
            </div>
          </div>
        </form>
      </main>
    </div>
  )
}

// ── 재사용 컴포넌트 ──
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
