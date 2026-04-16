'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useUnsavedWarning } from '@/hooks/useUnsavedWarning'
import { useToast } from '@/hooks/useToast'
import TechStackInput from '@/components/TechStackInput'
import ThumbnailUploader from '@/components/ThumbnailUploader'
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
  const { showToast } = useToast()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [preview, setPreview] = useState(false)
  const [formData, setFormData] = useState(EMPTY_FORM)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)

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
      showToast('포스트가 작성되었습니다.')
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
    if (hasChanges) {
      setShowCancelConfirm(true)
      return
    }
    router.back()
  }

  if (!authReady || !isAdmin) return <Spinner />

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <ConfirmDialog
        open={showCancelConfirm}
        title="작성 취소"
        description="입력한 내용이 모두 사라집니다. 취소할까요?"
        confirmLabel="취소하기"
        cancelLabel="계속 작성"
        variant="warning"
        onConfirm={() => router.back()}
        onCancel={() => setShowCancelConfirm(false)}
      />

      <EditorBar
        title="포스트 작성"
        hasChanges={hasChanges}
        submitting={submitting}
        onCancel={handleCancel}
        formId="new-post-form"
        submitLabel="작성하기"
        preview={preview}
        onPreviewChange={setPreview}
      />

      <main className="mx-auto max-w-[1000px] px-5 py-8">
        {error && <ErrorAlert message={error} />}

        {!preview ? (
          <form id="new-post-form" onSubmit={handleSubmit}>
            <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800 sm:p-8">
              <FormField label="제목" required>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="포스트 제목"
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
              <FormField label="썸네일 이미지">
                <ThumbnailUploader
                  value={formData.thumbnailUrl}
                  onChange={(url) => setFormData({ ...formData, thumbnailUrl: url })}
                />
              </FormField>
              <div className="mb-5 grid gap-5 sm:grid-cols-2">
                <FormField label="카테고리" required>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as 'tutorial' | 'essay' | 'review' | 'news' })}
                    className={inputClass}
                  >
                    <option value="tutorial">튜토리얼</option>
                    <option value="essay">에세이</option>
                    <option value="review">리뷰</option>
                    <option value="news">뉴스</option>
                  </select>
                </FormField>
                <FormField label="태그">
                  <TechStackInput
                    value={formData.tags}
                    onChange={(v) => setFormData({ ...formData, tags: v })}
                  />
                </FormField>
              </div>
              <FormField label="본문 (Markdown)" required>
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
              </FormField>
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
              <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
                {formData.content || '*내용 없음*'}
              </ReactMarkdown>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
