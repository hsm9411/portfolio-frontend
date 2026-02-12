'use client'

import { useState, useEffect } from 'react'
import { getComments, createComment, type Comment } from '@/lib/api/comments'
import { createClient } from '@/lib/supabase/client'
import { formatDistanceToNow } from 'date-fns'
import { ko } from 'date-fns/locale'

interface CommentSectionProps {
  targetType: 'project' | 'post'
  targetId: string
}

export default function CommentSection({ targetType, targetId }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [newComment, setNewComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const supabase = createClient()

  // 인증 상태 확인
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session)
    })
  }, [supabase.auth])

  // 댓글 불러오기
  useEffect(() => {
    loadComments()
  }, [targetType, targetId])

  const loadComments = async () => {
    try {
      setLoading(true)
      const response = await getComments({ targetType, targetId, limit: 50 })
      setComments(response.items)
    } catch (error) {
      console.error('Failed to load comments:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newComment.trim()) {
      alert('댓글 내용을 입력해주세요.')
      return
    }

    if (!isAuthenticated) {
      alert('댓글은 로그인 후 작성할 수 있습니다.')
      return
    }

    try {
      setSubmitting(true)
      await createComment({
        targetType,
        targetId,
        content: newComment.trim(),
      })
      setNewComment('')
      await loadComments()
    } catch (error: any) {
      console.error('Failed to create comment:', error)
      alert(error.response?.data?.message || '댓글 작성 중 오류가 발생했습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mt-8">
      <h3 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">
        댓글 {comments.length}개
      </h3>

      {/* 댓글 작성 폼 */}
      <form onSubmit={handleSubmit} className="mb-6">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder={isAuthenticated ? "댓글을 작성해주세요..." : "로그인 후 댓글을 작성할 수 있습니다."}
          disabled={!isAuthenticated || submitting}
          rows={3}
          className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:disabled:bg-gray-700"
        />
        <div className="mt-2 flex justify-end">
          <button
            type="submit"
            disabled={!isAuthenticated || submitting || !newComment.trim()}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? '작성 중...' : '댓글 작성'}
          </button>
        </div>
      </form>

      {/* 댓글 목록 */}
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
        </div>
      ) : comments.length === 0 ? (
        <div className="py-8 text-center text-sm text-gray-500">
          첫 댓글을 작성해보세요!
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800"
            >
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900 dark:text-white">
                    {comment.authorNickname}
                  </span>
                  {comment.isAnonymous && (
                    <span className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600 dark:bg-gray-700 dark:text-gray-400">
                      익명
                    </span>
                  )}
                </div>
                <span className="text-xs text-gray-500">
                  {formatDistanceToNow(new Date(comment.createdAt), {
                    addSuffix: true,
                    locale: ko,
                  })}
                </span>
              </div>
              <p className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300">
                {comment.content}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
