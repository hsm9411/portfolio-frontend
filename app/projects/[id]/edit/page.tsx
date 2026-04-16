'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useUnsavedWarning } from '@/hooks/useUnsavedWarning'
import { useToast } from '@/hooks/useToast'
import { getProject } from '@/lib/api/projects'
import TechStackInput from '@/components/TechStackInput'
import ThumbnailUploader from '@/components/ThumbnailUploader'
import FormField from '@/components/ui/FormField'
import ErrorAlert from '@/components/ui/ErrorAlert'
import Spinner from '@/components/ui/Spinner'
import EditorBar from '@/components/EditorBar'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import { inputClass } from '@/lib/styles/form'
import api from '@/lib/api/client'

export default function EditProjectPage() {
  const params = useParams()
  const router = useRouter()
  const { isAdmin, authReady } = useAuth()
  const { showToast } = useToast()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)

  const [formData, setFormData] = useState({
    title: '',
    summary: '',
    description: '',
    thumbnailUrl: '',
    demoUrl: '',
    githubUrl: '',
    techStack: [] as string[],
    tags: [] as string[],
    status: 'in-progress' as 'in-progress' | 'completed' | 'archived',
  })
  const [originalData, setOriginalData] = useState(formData)
  const hasChanges = JSON.stringify(formData) !== JSON.stringify(originalData)

  useUnsavedWarning(hasChanges)

  useEffect(() => {
    if (!authReady) return
    if (!isAdmin) {
      router.replace('/projects')
      return
    }
    if (params.id) loadProject(params.id as string)
  }, [params.id, isAdmin, authReady])

  const loadProject = async (id: string) => {
    try {
      setLoading(true)
      const project = await getProject(id)
      const data = {
        title: project.title,
        summary: project.summary,
        description: project.description,
        thumbnailUrl: project.thumbnailUrl || '',
        demoUrl: project.demoUrl || '',
        githubUrl: project.githubUrl || '',
        techStack: project.techStack || [],
        tags: project.tags || [],
        status: project.status,
      }
      setFormData(data)
      setOriginalData(data)
    } catch {
      router.push('/projects')
    } finally {
      setLoading(false)
    }
  }

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

      await api.patch(`/projects/${params.id}`, payload)
      showToast('프로젝트가 수정되었습니다.')
      router.replace(`/projects/${params.id}`)
    } catch (err: unknown) {
      const e = err as { message?: string | string[] }
      setError(Array.isArray(e.message) ? e.message.join(', ') : e.message || '수정에 실패했습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleCancel = () => {
    if (hasChanges) {
      setShowCancelConfirm(true)
      return
    }
    router.push(`/projects/${params.id}`)
  }

  if (!authReady || loading) return <Spinner />
  if (!isAdmin) return null

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <ConfirmDialog
        open={showCancelConfirm}
        title="수정 취소"
        description="변경사항이 저장되지 않습니다. 취소할까요?"
        confirmLabel="취소하기"
        cancelLabel="계속 수정"
        variant="warning"
        onConfirm={() => router.push(`/projects/${params.id}`)}
        onCancel={() => setShowCancelConfirm(false)}
      />

      <EditorBar
        title="프로젝트 수정"
        hasChanges={hasChanges}
        submitting={submitting}
        onCancel={handleCancel}
        formId="edit-project-form"
      />

      <main className="mx-auto max-w-[1000px] px-5 py-8">
        {error && <ErrorAlert message={error} />}

        <form id="edit-project-form" onSubmit={handleSubmit}>
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
