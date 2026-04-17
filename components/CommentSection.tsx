'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getComments, createComment, deleteComment, type Comment } from '@/lib/api/comments'
import { useToast } from '@/hooks/useToast'
import { useAuth } from '@/hooks/useAuth'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import { formatDistanceToNow } from 'date-fns'
import { ko } from 'date-fns/locale'

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
  const [loading, setLoading] = useState(true)
  const [newComment, setNewComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)

  useEffect(() => {
    loadComments()
  }, [targetType, targetId])

  const loadComments = async () => {
    try {
      setLoading(true)
      const data = await getComments(targetType, targetId)
      setComments(data)
    } catch {
      setComments([])
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTargetId) return
    try {
      await deleteComment(deleteTargetId)
      setDeleteTargetId(null)
      await loadComments()
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
      await loadComments()
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
          댓글 <span className="text-gray-400 dark:text-gray-500">{comments.length}</span>
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
                  {(comment.isMine || isAdmin) && (
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
              <p className="whitespace-pre-wrap pl-9 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                {comment.content}
              </p>
            </div>
          ))}
        </div>
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
