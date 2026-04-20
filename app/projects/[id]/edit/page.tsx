'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useUnsavedWarning } from '@/hooks/useUnsavedWarning'
import { useToast } from '@/hooks/useToast'
import { getProject } from '@/lib/api/projects'
import TechStackInput from '@/components/TechStackInput'
import ThumbnailUploader from '@/components/ThumbnailUploader'
import ImageGalleryUploader from '@/components/ImageGalleryUploader'
import FormField from '@/components/ui/FormField'
import ErrorAlert from '@/components/ui/ErrorAlert'
import Spinner from '@/components/ui/Spinner'
import EditorBar from '@/components/EditorBar'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import { inputClass } from '@/lib/styles/form'
import api from '@/lib/api/client'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'

const STATUS_CONFIG = {
  'in-progress': { label: '진행중', className: 'bg-blue-50 text-blue-700 ring-blue-600/20 dark:bg-blue-900/30 dark:text-blue-400 dark:ring-blue-500/30' },
  completed:     { label: '완료',   className: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-900/30 dark:text-emerald-400 dark:ring-emerald-500/30' },
  archived:      { label: '보관',   className: 'bg-gray-100 text-gray-600 ring-gray-500/20 dark:bg-gray-700 dark:text-gray-400 dark:ring-gray-500/30' },
}

export default function EditProjectPage() {
  const params = useParams()
  const router = useRouter()
  const { isAdmin, authReady } = useAuth()
  const { showToast } = useToast()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [preview, setPreview] = useState(false)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)

  const [formData, setFormData] = useState({
    title: '',
    summary: '',
    description: '',
    thumbnailUrl: '',
    imageUrls: [] as string[],
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
    if (!isAdmin) { router.replace('/projects'); return }
    if (params.id) loadProject(params.id as string)
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
        imageUrls: project.imageUrls || [],
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
      payload.imageUrls = formData.imageUrls
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
    if (hasChanges) { setShowCancelConfirm(true); return }
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
        preview={preview}
        onPreviewChange={setPreview}
      />

      <main className="mx-auto max-w-[1000px] px-5 py-8">
        {error && <ErrorAlert message={error} />}

        {!preview ? (
          <form id="edit-project-form" onSubmit={handleSubmit}>
            <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800 sm:p-8">

              {/* 기본 정보 */}
              <p className="mb-5 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">기본 정보</p>
              <FormField label="제목" required>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="프로젝트 제목"
                  className={`${inputClass} font-semibold`}
                />
              </FormField>
              <FormField label="한 줄 요약" required>
                <input
                  type="text"
                  value={formData.summary}
                  onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                  placeholder="목록/카드에 표시될 한 줄 소개"
                  className={inputClass}
                />
              </FormField>
              <div className="grid gap-5 sm:grid-cols-2">
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
                <FormField label="썸네일 이미지">
                  <ThumbnailUploader
                    value={formData.thumbnailUrl}
                    onChange={(url) => setFormData({ ...formData, thumbnailUrl: url })}
                  />
                </FormField>
              </div>

              <div className="my-6 border-t border-gray-100 dark:border-gray-700" />

              {/* 이미지 갤러리 */}
              <p className="mb-5 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">이미지 갤러리</p>
              <FormField label="갤러리 이미지">
                <ImageGalleryUploader
                  value={formData.imageUrls}
                  onChange={(urls) => setFormData({ ...formData, imageUrls: urls })}
                />
              </FormField>

              <div className="my-6 border-t border-gray-100 dark:border-gray-700" />

              {/* 상세 설명 */}
              <p className="mb-5 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">상세 설명 (Markdown)</p>
              <FormField label="프로젝트 설명" required>
                <textarea
                  value={formData.description}
                  rows={20}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder={`## 프로젝트 개요\n\n이 프로젝트는...\n\n## 주요 기능\n\n- 기능 1\n- 기능 2\n\n## 기술적 도전\n\n\`\`\`javascript\nconst example = 'code';\n\`\`\``}
                  className={`${inputClass} font-mono text-sm leading-relaxed`}
                />
                <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">
                  Markdown 문법을 지원합니다. 미리보기 탭에서 렌더링을 확인하세요.
                </p>
              </FormField>

              <div className="my-6 border-t border-gray-100 dark:border-gray-700" />

              {/* 기술 & 태그 */}
              <p className="mb-5 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">기술 & 태그</p>
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

              <div className="my-6 border-t border-gray-100 dark:border-gray-700" />

              {/* 링크 */}
              <p className="mb-5 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">링크</p>
              <div className="grid gap-5 sm:grid-cols-2">
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
        ) : (
          <div className="rounded-xl border border-gray-200 bg-white p-8 dark:border-gray-700 dark:bg-gray-800 sm:p-12">
            <div className="mb-4">
              <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${STATUS_CONFIG[formData.status].className}`}>
                {STATUS_CONFIG[formData.status].label}
              </span>
            </div>
            <h1 className="mb-3 text-3xl font-bold text-gray-900 dark:text-white">
              {formData.title || '제목 없음'}
            </h1>
            <p className="mb-6 text-lg text-gray-500 dark:text-gray-400">
              {formData.summary || '요약 없음'}
            </p>
            {formData.techStack.length > 0 && (
              <div className="mb-6 flex flex-wrap gap-2">
                {formData.techStack.map((tech) => (
                  <span key={tech} className="rounded-lg bg-blue-50 px-3 py-1.5 text-sm font-semibold text-blue-700 ring-1 ring-blue-600/20 dark:bg-blue-900/30 dark:text-blue-300 dark:ring-blue-500/30">
                    {tech}
                  </span>
                ))}
              </div>
            )}
            <div className="markdown-body">
              <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
                {formData.description || '*내용 없음*'}
              </ReactMarkdown>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
