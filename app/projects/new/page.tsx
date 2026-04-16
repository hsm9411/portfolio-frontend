'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useUnsavedWarning } from '@/hooks/useUnsavedWarning'
import TechStackInput from '@/components/TechStackInput'
import ThumbnailUploader from '@/components/ThumbnailUploader'
import FormField from '@/components/ui/FormField'
import ErrorAlert from '@/components/ui/ErrorAlert'
import Spinner from '@/components/ui/Spinner'
import EditorBar from '@/components/EditorBar'
import { inputClass } from '@/lib/styles/form'
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
  const { isAdmin, authReady } = useAuth()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState(EMPTY_FORM)

  const hasChanges = JSON.stringify(formData) !== JSON.stringify(EMPTY_FORM)
  useUnsavedWarning(hasChanges)

  useEffect(() => {
    if (authReady && !isAdmin) router.replace('/projects')
  }, [authReady, isAdmin, router])

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
      const payload: Record<string, unknown> = {
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
      setError(Array.isArray(e.message) ? e.message.join(', ') : e.message || '작성에 실패했습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleCancel = () => {
    if (hasChanges && !confirm('작성을 취소할까요? 입력한 내용이 사라집니다.')) return
    router.back()
  }

  if (!authReady || !isAdmin) return <Spinner />

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <EditorBar
        title="프로젝트 작성"
        hasChanges={hasChanges}
        submitting={submitting}
        onCancel={handleCancel}
        formId="project-form"
        submitLabel="작성하기"
      />

      <main className="mx-auto max-w-[1000px] px-5 py-8">
        {error && <ErrorAlert message={error} />}

        <form id="project-form" onSubmit={handleSubmit}>
          <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800 sm:p-8">
            <FormField label="제목" required>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="프로젝트 제목"
                className={`${inputClass} font-semibold`}
              />
            </FormField>
            <FormField label="요약" required>
              <input
                type="text"
                value={formData.summary}
                onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                placeholder="한 줄 소개"
                className={inputClass}
              />
            </FormField>
            <FormField label="상세 설명" required>
              <textarea
                value={formData.description}
                rows={10}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="프로젝트 상세 설명"
                className={inputClass}
              />
            </FormField>
            <FormField label="기술 스택" required>
              <TechStackInput
                value={formData.techStack}
                onChange={(v) => setFormData({ ...formData, techStack: v })}
              />
            </FormField>
            <FormField label="태그">
              <TechStackInput
                value={formData.tags}
                onChange={(v) => setFormData({ ...formData, tags: v })}
              />
            </FormField>
            <div className="grid gap-5 sm:grid-cols-2">
              <FormField label="썸네일 이미지">
                <ThumbnailUploader
                  value={formData.thumbnailUrl}
                  onChange={(url) => setFormData({ ...formData, thumbnailUrl: url })}
                />
              </FormField>
              <FormField label="상태">
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as 'in-progress' | 'completed' | 'archived' })}
                  className={inputClass}
                >
                  <option value="in-progress">진행중</option>
                  <option value="completed">완료</option>
                  <option value="archived">보관</option>
                </select>
              </FormField>
              <FormField label="데모 URL">
                <input
                  type="url"
                  value={formData.demoUrl}
                  onChange={(e) => setFormData({ ...formData, demoUrl: e.target.value })}
                  placeholder="https://demo.example.com"
                  className={inputClass}
                />
              </FormField>
              <FormField label="GitHub URL">
                <input
                  type="url"
                  value={formData.githubUrl}
                  onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                  placeholder="https://github.com/username/repo"
                  className={inputClass}
                />
              </FormField>
            </div>
          </div>
        </form>
      </main>
    </div>
  )
}
