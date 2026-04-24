'use client'

import { useState, useEffect, useMemo } from 'react'
import ReactMarkdown from 'react-markdown'
import type { Components } from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { formatDistanceToNow } from 'date-fns'
import { ko } from 'date-fns/locale'
import { getUpdates, createUpdate, updateUpdate, deleteUpdate, type ProjectUpdate } from '@/lib/api/updates'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'
import ConfirmDialog from '@/components/ui/ConfirmDialog'

interface Props {
  projectId: string
}

export default function UpdateTimeline({ projectId }: Props) {
  const { isAdmin } = useAuth()
  const { showToast } = useToast()

  const [updates, setUpdates] = useState<ProjectUpdate[]>([])
  const [loading, setLoading] = useState(true)

  // 추가 폼
  const [showAddForm, setShowAddForm] = useState(false)
  const [addTitle, setAddTitle] = useState('')
  const [addContent, setAddContent] = useState('')
  const [addExternalUrl, setAddExternalUrl] = useState('')
  const [addSubmitting, setAddSubmitting] = useState(false)

  // 수정
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editContent, setEditContent] = useState('')
  const [editExternalUrl, setEditExternalUrl] = useState('')
  const [editSubmitting, setEditSubmitting] = useState(false)

  // 삭제
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)

  useEffect(() => {
    load()
  }, [projectId])

  const load = async () => {
    try {
      setLoading(true)
      const data = await getUpdates(projectId)
      setUpdates(data)
    } catch {
      setUpdates([])
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!addTitle.trim() || !addContent.trim()) return
    try {
      setAddSubmitting(true)
      await createUpdate(projectId, {
        title: addTitle.trim(),
        content: addContent.trim(),
        ...(addExternalUrl.trim() ? { externalUrl: addExternalUrl.trim() } : {}),
      })
      setShowAddForm(false)
      setAddTitle('')
      setAddContent('')
      setAddExternalUrl('')
      await load()
      showToast('업데이트가 등록되었습니다.')
    } catch {
      showToast('등록에 실패했습니다. 다시 시도해주세요.', 'error')
    } finally {
      setAddSubmitting(false)
    }
  }

  const handleEditStart = (item: ProjectUpdate) => {
    setEditingId(item.id)
    setEditTitle(item.title)
    setEditContent(item.content)
    setEditExternalUrl(item.externalUrl ?? '')
  }

  const handleEditCancel = () => {
    setEditingId(null)
    setEditTitle('')
    setEditContent('')
    setEditExternalUrl('')
  }

  const handleEditSave = async (id: string) => {
    if (!editTitle.trim() || !editContent.trim()) return
    try {
      setEditSubmitting(true)
      await updateUpdate(id, {
        title: editTitle.trim(),
        content: editContent.trim(),
        ...(editExternalUrl.trim() ? { externalUrl: editExternalUrl.trim() } : { externalUrl: undefined }),
      })
      handleEditCancel()
      await load()
      showToast('업데이트가 수정되었습니다.')
    } catch {
      showToast('수정에 실패했습니다. 다시 시도해주세요.', 'error')
    } finally {
      setEditSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTargetId) return
    try {
      await deleteUpdate(deleteTargetId)
      setDeleteTargetId(null)
      await load()
      showToast('업데이트가 삭제되었습니다.')
    } catch {
      showToast('삭제에 실패했습니다. 다시 시도해주세요.', 'error')
    }
  }

  const markdownComponents: Components = useMemo(() => ({
    table: ({ children }) => (
      <div className="overflow-x-auto"><table>{children}</table></div>
    ),
  }), [])

  const inputClass = 'w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 placeholder-gray-400 focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:placeholder-gray-500 dark:focus:border-teal-500'

  return (
    <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-200 dark:bg-gray-800 dark:ring-gray-700 sm:p-8">
      {/* 헤더 */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <svg className="h-5 w-5 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-base font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Changelog
          </h3>
        </div>
        {isAdmin && !showAddForm && (
          <button
            type="button"
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            추가
          </button>
        )}
      </div>

      {/* 추가 폼 */}
      {isAdmin && showAddForm && (
        <form onSubmit={handleAdd} className="mb-6 rounded-xl border border-teal-200 bg-teal-50/50 p-4 dark:border-teal-800/50 dark:bg-teal-900/10">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-teal-600 dark:text-teal-400">새 업데이트</p>
          <div className="space-y-2.5">
            <input
              type="text"
              value={addTitle}
              onChange={(e) => setAddTitle(e.target.value)}
              placeholder="제목"
              className={inputClass}
            />
            <textarea
              value={addContent}
              onChange={(e) => setAddContent(e.target.value)}
              placeholder="내용 (Markdown 지원)"
              rows={4}
              className={`${inputClass} resize-none`}
            />
            <input
              type="url"
              value={addExternalUrl}
              onChange={(e) => setAddExternalUrl(e.target.value)}
              placeholder="관련 URL (선택, PR 링크·배포 링크 등)"
              className={inputClass}
            />
          </div>
          <div className="mt-3 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => { setShowAddForm(false); setAddTitle(''); setAddContent(''); setAddExternalUrl('') }}
              className="rounded-lg px-3 py-1.5 text-xs font-medium text-gray-500 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={addSubmitting || !addTitle.trim() || !addContent.trim()}
              className="flex items-center gap-1.5 rounded-lg bg-teal-600 px-4 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {addSubmitting ? (
                <>
                  <div className="h-3 w-3 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  등록 중
                </>
              ) : '등록'}
            </button>
          </div>
        </form>
      )}

      {/* 타임라인 목록 */}
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="h-7 w-7 animate-spin rounded-full border-4 border-gray-200 border-t-teal-600" />
        </div>
      ) : updates.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 py-10 text-center dark:border-gray-700">
          <svg className="mx-auto mb-3 h-10 w-10 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm text-gray-400 dark:text-gray-500">아직 업데이트 내역이 없습니다.</p>
        </div>
      ) : (
        <ol className="relative border-l border-gray-200 dark:border-gray-700">
          {updates.map((item) => (
            <li key={item.id} className="mb-5 ml-4 last:mb-0 sm:mb-8">
              {/* 타임라인 점 */}
              <div className="absolute -left-1.5 mt-1 h-3 w-3 rounded-full border-2 border-white bg-teal-500 dark:border-gray-800 dark:bg-teal-400" />

              {editingId === item.id ? (
                /* 수정 폼 */
                <div className="rounded-xl border border-teal-200 bg-teal-50/50 p-4 dark:border-teal-800/50 dark:bg-teal-900/10">
                  <div className="space-y-2.5">
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className={inputClass}
                    />
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      rows={4}
                      className={`${inputClass} resize-none`}
                    />
                    <input
                      type="url"
                      value={editExternalUrl}
                      onChange={(e) => setEditExternalUrl(e.target.value)}
                      placeholder="관련 URL (선택)"
                      className={inputClass}
                    />
                  </div>
                  <div className="mt-3 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={handleEditCancel}
                      className="rounded-lg px-3 py-1.5 text-xs font-medium text-gray-500 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
                    >
                      취소
                    </button>
                    <button
                      type="button"
                      onClick={() => handleEditSave(item.id)}
                      disabled={
                        editSubmitting ||
                        !editTitle.trim() ||
                        !editContent.trim() ||
                        (editTitle.trim() === item.title && editContent.trim() === item.content && editExternalUrl.trim() === (item.externalUrl ?? ''))
                      }
                      className="flex items-center gap-1.5 rounded-lg bg-teal-600 px-4 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {editSubmitting ? (
                        <>
                          <div className="h-3 w-3 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                          저장 중
                        </>
                      ) : '저장'}
                    </button>
                  </div>
                </div>
              ) : (
                /* 읽기 뷰 */
                <div>
                  <div className="mb-1 flex flex-wrap items-start justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white">{item.title}</h4>
                      {item.externalUrl && (
                        <a
                          href={item.externalUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600"
                        >
                          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                          링크
                        </a>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <time className="text-xs text-gray-400 dark:text-gray-500">
                        {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true, locale: ko })}
                      </time>
                      {isAdmin && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleEditStart(item)}
                            className="rounded p-0.5 text-gray-300 transition-colors hover:text-teal-500 dark:text-gray-600 dark:hover:text-teal-400"
                            aria-label="수정"
                          >
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTargetId(item.id)}
                            className="rounded p-0.5 text-gray-300 transition-colors hover:text-red-500 dark:text-gray-600 dark:hover:text-red-400"
                            aria-label="삭제"
                          >
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="markdown-body text-sm">
                    <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                      {item.content}
                    </ReactMarkdown>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ol>
      )}

      <ConfirmDialog
        open={!!deleteTargetId}
        title="업데이트 삭제"
        description="이 업데이트 내역을 삭제하시겠습니까? 삭제된 내용은 복구할 수 없습니다."
        confirmLabel="삭제"
        cancelLabel="취소"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTargetId(null)}
      />
    </section>
  )
}
