'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getComments, createComment, updateComment, deleteComment, type Comment } from '@/lib/api/comments'
import { useToast } from '@/hooks/useToast'
import { useAuth } from '@/hooks/useAuth'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import { formatDistanceToNow } from 'date-fns'
import { ko } from 'date-fns/locale'

const PAGE_SIZE = 10

interface CommentSectionProps {
  targetType: 'project' | 'post'
  targetId: string
}

export default function CommentSection({ targetType, targetId }: CommentSectionProps) {
  const router = useRouter()
  const { showToast } = useToast()
  const { user, isAdmin } = useAuth()
  const isAuthenticated = !!user
  const [comments, setComments] = useState<Comment[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [newComment, setNewComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')
  const [editSubmitting, setEditSubmitting] = useState(false)

  useEffect(() => {
    loadInitial()
  }, [targetType, targetId])

  const loadInitial = async () => {
    try {
      setLoading(true)
      const data = await getComments(targetType, targetId, 1, PAGE_SIZE)
      setComments(data.items)
      setTotal(data.total)
      setPage(1)
      setHasMore(data.page < data.totalPages)
    } catch {
      setComments([])
      setTotal(0)
      setHasMore(false)
    } finally {
      setLoading(false)
    }
  }

  const loadMore = async () => {
    try {
      setLoadingMore(true)
      const nextPage = page + 1
      const data = await getComments(targetType, targetId, nextPage, PAGE_SIZE)
      setComments((prev) => [...prev, ...data.items])
      setPage(nextPage)
      setHasMore(nextPage < data.totalPages)
    } catch {
      showToast('댓글을 불러오지 못했습니다.', 'error')
    } finally {
      setLoadingMore(false)
    }
  }

  const handleEditStart = (comment: Comment) => {
    setEditingId(comment.id)
    setEditContent(comment.content)
  }

  const handleEditCancel = () => {
    setEditingId(null)
    setEditContent('')
  }

  const handleEditSave = async (id: string) => {
    if (!editContent.trim()) return
    try {
      setEditSubmitting(true)
      await updateComment(id, { content: editContent.trim() })
      setEditingId(null)
      setEditContent('')
      await loadInitial()
      showToast('댓글이 수정되었습니다.')
    } catch {
      showToast('댓글 수정에 실패했습니다. 다시 시도해주세요.', 'error')
    } finally {
      setEditSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTargetId) return
    try {
      await deleteComment(deleteTargetId)
      setDeleteTargetId(null)
      await loadInitial()
      showToast('댓글이 삭제되었습니다.')
    } catch {
      showToast('댓글 삭제에 실패했습니다. 다시 시도해주세요.', 'error')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim()) return
    if (!isAuthenticated) return

    try {
      setSubmitting(true)
      await createComment(targetType, targetId, { content: newComment.trim() })
      setNewComment('')
      await loadInitial()
      showToast('댓글이 등록되었습니다.')
    } catch {
      showToast('댓글 등록에 실패했습니다. 다시 시도해주세요.', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      {/* 헤더 */}
      <div className="mb-6 flex items-center gap-2">
        <svg className="h-5 w-5 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
          댓글 <span className="text-gray-400 dark:text-gray-500">{total}</span>
        </h3>
      </div>

      {/* 댓글 작성 폼 */}
      <form onSubmit={handleSubmit} className="mb-8">
        <div className={`rounded-xl border transition-colors ${
          isAuthenticated
            ? 'border-gray-200 focus-within:border-blue-400 dark:border-gray-700 dark:focus-within:border-blue-500'
            : 'border-gray-200 dark:border-gray-700'
        } bg-gray-50 dark:bg-gray-900`}>
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder={isAuthenticated ? '댓글을 작성해주세요...' : '댓글을 작성하려면 로그인이 필요합니다.'}
            disabled={!isAuthenticated || submitting}
            rows={3}
            className="w-full resize-none rounded-xl bg-transparent px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60 dark:text-gray-200 dark:placeholder-gray-500"
          />
          <div className="flex items-center justify-between border-t border-gray-200 px-4 py-2.5 dark:border-gray-700">
            {!isAuthenticated ? (
              <button
                type="button"
                onClick={() => router.push('/login')}
                className="text-xs text-blue-500 underline-offset-2 hover:underline dark:text-blue-400"
              >
                로그인하러 가기
              </button>
            ) : (
              <span className="text-xs text-gray-400 dark:text-gray-500">
                {newComment.length > 0 ? `${newComment.length}자` : ''}
              </span>
            )}
            <button
              type="submit"
              disabled={!isAuthenticated || submitting || !newComment.trim()}
              className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <div className="h-3 w-3 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  등록 중
                </>
              ) : '등록'}
            </button>
          </div>
        </div>
      </form>

      {/* 댓글 목록 */}
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="h-7 w-7 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
        </div>
      ) : comments.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 py-10 text-center dark:border-gray-700">
          <svg className="mx-auto mb-3 h-10 w-10 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <p className="text-sm text-gray-400 dark:text-gray-500">첫 댓글을 작성해보세요!</p>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {comments.map((comment) => (
              <div
                key={comment.id}
                className="rounded-xl border border-gray-100 bg-gray-50 p-4 dark:border-gray-700/50 dark:bg-gray-900"
              >
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {/* 아바타 이니셜 */}
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-violet-500 text-xs font-bold text-white">
                      {comment.user.nickname.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      {comment.user.nickname}
                    </span>
                    {comment.isAnonymous && (
                      <span className="rounded bg-gray-200 px-1.5 py-0.5 text-xs text-gray-500 dark:bg-gray-700 dark:text-gray-400">
                        익명
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400 dark:text-gray-500">
                      {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true, locale: ko })}
                    </span>
                    {comment.isMine && editingId !== comment.id && (
                      <button
                        type="button"
                        onClick={() => handleEditStart(comment)}
                        className="rounded p-0.5 text-gray-300 transition-colors hover:text-blue-500 dark:text-gray-600 dark:hover:text-blue-400"
                        aria-label="댓글 수정"
                      >
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                    )}
                    {(comment.isMine || isAdmin) && editingId !== comment.id && (
                      <button
                        type="button"
                        onClick={() => setDeleteTargetId(comment.id)}
                        className="rounded p-0.5 text-gray-300 transition-colors hover:text-red-500 dark:text-gray-600 dark:hover:text-red-400"
                        aria-label="댓글 삭제"
                      >
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
                {editingId === comment.id ? (
                  <div className="pl-9">
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      rows={3}
                      className="w-full resize-none rounded-lg border border-blue-400 bg-white px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-blue-500 dark:bg-gray-800 dark:text-gray-200"
                    />
                    <div className="mt-2 flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={handleEditCancel}
                        className="rounded-lg px-3 py-1.5 text-xs font-medium text-gray-500 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
                      >
                        취소
                      </button>
                      <button
                        type="button"
                        onClick={() => handleEditSave(comment.id)}
                        disabled={editSubmitting || !editContent.trim() || editContent.trim() === comment.content}
                        className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
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
                  <p className="whitespace-pre-wrap pl-9 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                    {comment.content}
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* 더보기 버튼 */}
          {hasMore && (
            <div className="mt-4 flex justify-center">
              <button
                type="button"
                onClick={loadMore}
                disabled={loadingMore}
                className="flex items-center gap-2 rounded-lg border border-gray-200 px-5 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
              >
                {loadingMore ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
                    불러오는 중
                  </>
                ) : (
                  <>
                    더보기
                    <span className="text-xs text-gray-400 dark:text-gray-500">
                      ({comments.length}/{total})
                    </span>
                  </>
                )}
              </button>
            </div>
          )}
        </>
      )}

      <ConfirmDialog
        open={!!deleteTargetId}
        title="댓글 삭제"
        description="이 댓글을 삭제하시겠습니까? 삭제된 댓글은 복구할 수 없습니다."
        confirmLabel="삭제"
        cancelLabel="취소"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTargetId(null)}
      />
    </div>
  )
}
