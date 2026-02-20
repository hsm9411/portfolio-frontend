'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getPostById, type Post } from '@/lib/api/posts'
import { useAuth } from '@/hooks/useAuth'
import LikeButton from '@/components/LikeButton'
import CommentSection from '@/components/CommentSection'
import ReactMarkdown from 'react-markdown'
import { formatDistanceToNow } from 'date-fns'
import { ko } from 'date-fns/locale'
import api from '@/lib/api/client'

export default function BlogPostPage() {
  const params = useParams()
  const router = useRouter()
  const { isAdmin } = useAuth()
  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  useEffect(() => {
    if (params.id) loadPost(params.id as string)
  }, [params.id])

  const loadPost = async (id: string) => {
    try {
      setLoading(true)
      const data = await getPostById(id)
      setPost(data)
    } catch (error: any) {
      console.error('Failed to load post:', error)
      router.push('/blog')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!post) return
    try {
      setDeleting(true)
      await api.delete(`/posts/${post.id}`)
      router.push('/blog')
    } catch (error: unknown) {
      console.error('Failed to delete post:', error)
      setShowDeleteConfirm(false)
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
      </div>
    )
  }

  if (!post) return null

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">

      {/* ── 삭제 확인 모달 ── */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-800">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
              <svg className="h-6 w-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <h3 className="mb-2 text-lg font-bold text-gray-900 dark:text-white">포스트 삭제</h3>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
              <span className="font-medium text-gray-900 dark:text-white">"{post.title}"</span>을(를) 삭제합니다. 이 작업은 되돌릴 수 없습니다.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                취소
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-60"
              >
                {deleting ? '삭제 중...' : '삭제'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 상단 네비게이션 바 ── */}
      <div className="sticky top-16 z-40 border-b border-gray-200/80 bg-white/90 backdrop-blur-md dark:border-gray-800/80 dark:bg-gray-900/90">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            목록으로
          </button>

          {isAdmin && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => router.push(`/blog/${post.id}/edit`)}
                className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                수정
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-sm font-medium text-red-600 shadow-sm transition-colors hover:bg-red-50 dark:border-red-900/50 dark:bg-gray-800 dark:text-red-400 dark:hover:bg-red-900/20"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                삭제
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── 헤더 ── */}
      <header className="border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-800/50">
        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
          {/* 태그 */}
          {post.tags.length > 0 && (
            <div className="mb-5 flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span key={tag} className="rounded-md bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 ring-1 ring-blue-600/20 dark:bg-blue-900/30 dark:text-blue-300 dark:ring-blue-500/30">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          <h1 className="mb-3 text-3xl font-bold leading-tight text-gray-900 dark:text-white sm:text-4xl">
            {post.title}
          </h1>
          <p className="mb-6 text-lg leading-relaxed text-gray-600 dark:text-gray-400">
            {post.summary}
          </p>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1.5">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              {post.authorNickname}
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: ko })}
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
              {post.viewCount.toLocaleString()}
            </span>
            {post.readingTime && (
              <span className="flex items-center gap-1.5">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                {post.readingTime}분 읽기
              </span>
            )}
          </div>
        </div>
      </header>

      {/* ── 본문 ── */}
      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="space-y-8">
          {/* Markdown */}
          <section className="rounded-2xl border border-gray-200 bg-white px-6 py-10 shadow-sm dark:border-gray-700 dark:bg-gray-800 sm:px-10 sm:py-12">
            <article className="prose prose-lg max-w-none dark:prose-invert
              prose-headings:font-bold prose-headings:tracking-tight
              prose-h1:text-3xl prose-h1:mt-12 prose-h1:mb-6
              prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-5 prose-h2:border-b prose-h2:border-gray-200 prose-h2:pb-3 dark:prose-h2:border-gray-700
              prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-4
              prose-p:leading-8 prose-p:text-gray-700 prose-p:my-5 dark:prose-p:text-gray-300
              prose-a:text-blue-600 prose-a:font-medium hover:prose-a:text-blue-700 dark:prose-a:text-blue-400
              prose-strong:text-gray-900 prose-strong:font-semibold dark:prose-strong:text-white
              prose-ul:my-5 prose-ul:space-y-2 prose-ol:my-5 prose-ol:space-y-2
              prose-li:text-gray-700 prose-li:leading-7 dark:prose-li:text-gray-300
              prose-blockquote:border-l-4 prose-blockquote:border-blue-400 prose-blockquote:bg-blue-50 prose-blockquote:px-6 prose-blockquote:py-4 prose-blockquote:my-6 prose-blockquote:rounded-r-lg dark:prose-blockquote:bg-blue-900/20 dark:prose-blockquote:border-blue-500
              prose-code:rounded prose-code:bg-gray-100 dark:prose-code:bg-gray-700 prose-code:px-1.5 prose-code:py-0.5 prose-code:text-sm prose-code:font-mono prose-code:text-pink-600 dark:prose-code:text-pink-400 prose-code:before:content-[''] prose-code:after:content-['']
              prose-pre:my-6 prose-pre:rounded-xl prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:shadow-md prose-pre:overflow-x-auto
              prose-img:rounded-xl prose-img:shadow-sm prose-img:my-8
              prose-hr:my-10 prose-hr:border-gray-200 dark:prose-hr:border-gray-700">
              <ReactMarkdown>{post.content}</ReactMarkdown>
            </article>
          </section>

          {/* 좋아요 */}
          <div className="rounded-2xl border border-gray-200 bg-white px-6 py-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <LikeButton targetType="post" targetId={post.id} initialLikeCount={post.likeCount} />
          </div>

          {/* 댓글 */}
          <div className="rounded-2xl border border-gray-200 bg-white px-6 py-8 shadow-sm dark:border-gray-700 dark:bg-gray-800 sm:px-8">
            <CommentSection targetType="post" targetId={post.id} />
          </div>
        </div>
      </main>
    </div>
  )
}
