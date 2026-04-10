'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { type Post } from '@/lib/api/posts'
import { useAuth } from '@/hooks/useAuth'
import LikeButton from '@/components/LikeButton'
import CommentSection from '@/components/CommentSection'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import { formatDistanceToNow } from 'date-fns'
import { ko } from 'date-fns/locale'
import api from '@/lib/api/client'

interface Props {
  post: Post
}

export default function BlogPostClient({ post }: Props) {
  const router = useRouter()
  const { isAdmin } = useAuth()
  const [deleting, setDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const fromRef = useRef<'list' | 'home'>('home')
  useEffect(() => {
    const prev = document.referrer
    fromRef.current =
      prev.includes('/blog') && !prev.includes(`/blog/${post.id}`)
        ? 'list'
        : 'home'
  }, [post.id])

  const handleBack = () => {
    fromRef.current === 'list' ? router.back() : router.push('/blog')
  }

  const handleDelete = async () => {
    try {
      setDeleting(true)
      await api.delete(`/posts/${post.id}`)
      router.push('/blog')
    } catch (err) {
      console.error('Failed to delete post:', err)
      setShowDeleteConfirm(false)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">

      {/* 삭제 확인 모달 */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl dark:bg-gray-800 sm:p-6">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30 sm:h-12 sm:w-12">
              <svg className="h-5 w-5 text-red-600 dark:text-red-400 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <h3 className="mb-2 text-base font-bold text-gray-900 dark:text-white sm:text-lg">포스트 삭제</h3>
            <p className="mb-5 text-xs text-gray-500 dark:text-gray-400 sm:mb-6 sm:text-sm">
              <span className="font-medium text-gray-900 dark:text-white">"{post.title}"</span>을(를) 삭제합니다. 이 작업은 되돌릴 수 없습니다.
            </p>
            <div className="flex gap-2.5 sm:gap-3">
              <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 rounded-xl border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700 sm:py-2.5 sm:text-sm">취소</button>
              <button onClick={handleDelete} disabled={deleting} className="flex-1 rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-60 sm:py-2.5 sm:text-sm">
                {deleting ? '삭제 중...' : '삭제'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 상단 네비게이션 */}
      <div className="sticky top-[72px] z-40 border-b border-gray-200 bg-white/90 backdrop-blur-md dark:border-gray-800 dark:bg-gray-900/90">
        <div className="mx-auto flex max-w-[1000px] items-center justify-between px-4 py-2.5 sm:px-5 sm:py-3">
          <button onClick={handleBack} className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white sm:gap-1.5 sm:px-3 sm:text-sm">
            <svg className="h-3.5 w-3.5 sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            {fromRef.current === 'list' ? '목록으로' : 'Blog'}
          </button>

          {isAdmin && (
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button onClick={() => router.push(`/blog/${post.id}/edit`)} className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 sm:gap-1.5 sm:px-3 sm:text-sm">
                <svg className="h-3 w-3 sm:h-3.5 sm:w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                수정
              </button>
              <button onClick={() => setShowDeleteConfirm(true)} className="flex items-center gap-1 rounded-lg border border-red-200 bg-white px-2.5 py-1.5 text-xs font-medium text-red-600 shadow-sm transition-colors hover:bg-red-50 dark:border-red-900/50 dark:bg-gray-800 dark:text-red-400 dark:hover:bg-red-900/20 sm:gap-1.5 sm:px-3 sm:text-sm">
                <svg className="h-3 w-3 sm:h-3.5 sm:w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                삭제
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 헤더 */}
      <header className="border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-800/50">
        <div className="mx-auto max-w-[1000px] px-4 py-6 sm:px-5 sm:py-10">
          {post.tags.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-1.5 sm:mb-5 sm:gap-2">
              {post.tags.map((tag) => (
                <span key={tag} className="rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700 ring-1 ring-blue-600/20 dark:bg-blue-900/30 dark:text-blue-300 dark:ring-blue-500/30 sm:px-2.5 sm:py-1 sm:text-xs">#{tag}</span>
              ))}
            </div>
          )}
          <h1 className="mb-2.5 text-2xl font-bold leading-tight text-gray-900 dark:text-white sm:mb-3 sm:text-3xl md:text-4xl">{post.title}</h1>
          <p className="mb-4 text-sm leading-relaxed text-gray-600 dark:text-gray-400 sm:mb-6 sm:text-lg">{post.summary}</p>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-gray-500 dark:text-gray-400 sm:gap-x-5 sm:gap-y-2 sm:text-sm">
            <span className="flex items-center gap-1 sm:gap-1.5">
              <svg className="h-3.5 w-3.5 sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              {post.authorNickname}
            </span>
            <span className="flex items-center gap-1 sm:gap-1.5">
              <svg className="h-3.5 w-3.5 sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: ko })}
            </span>
            <span className="flex items-center gap-1 sm:gap-1.5">
              <svg className="h-3.5 w-3.5 sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
              {post.viewCount.toLocaleString()}
            </span>
            {post.readingTime && (
              <span className="flex items-center gap-1 sm:gap-1.5">
                <svg className="h-3.5 w-3.5 sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                {post.readingTime}분 읽기
              </span>
            )}
          </div>
        </div>
      </header>

      {/* 본문 */}
      <main className="mx-auto max-w-[1000px] px-4 py-6 sm:px-5 sm:py-10">
        <div className="space-y-5 sm:space-y-8">
          <section className="rounded-2xl border border-gray-200 bg-white px-4 py-6 shadow-sm dark:border-gray-700 dark:bg-gray-800 sm:px-6 sm:py-10 md:px-10 md:py-12">
            <div className="markdown-body">
              <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>{post.content}</ReactMarkdown>
            </div>
          </section>

          <div className="rounded-2xl border border-gray-200 bg-white px-4 py-5 shadow-sm dark:border-gray-700 dark:bg-gray-800 sm:px-6">
            <LikeButton targetType="post" targetId={post.id} initialLikeCount={post.likeCount} />
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white px-4 py-6 shadow-sm dark:border-gray-700 dark:bg-gray-800 sm:px-6 sm:py-8 md:px-8">
            <CommentSection targetType="post" targetId={post.id} />
          </div>
        </div>
      </main>
    </div>
  )
}
