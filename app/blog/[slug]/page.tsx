'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getPostBySlug, type Post } from '@/lib/api/posts'
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

  const calculateReadTime = (content: string): number => {
    const wordsPerMinute = 500
    const wordCount = content.length
    return Math.max(1, Math.ceil(wordCount / wordsPerMinute))
  }

  useEffect(() => {
    if (params.slug) {
      loadPost(params.slug as string)
    }
  }, [params.slug])

  const loadPost = async (slug: string) => {
    try {
      setLoading(true)
      const data = await getPostBySlug(slug)
      setPost(data)
    } catch (error: any) {
      console.error('Failed to load post:', error)
      if (error.response?.status === 404) {
        alert('포스트를 찾을 수 없습니다.')
        router.push('/blog')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!post) return
    
    if (!confirm('정말 삭제하시겠습니까?')) return

    try {
      await api.delete(`/posts/${post.id}`)
      alert('포스트가 삭제되었습니다.')
      router.push('/blog')
    } catch (error: unknown) {
      console.error('Failed to delete post:', error)
      const err = error as { response?: { data?: { message?: string } } }
      alert(err.response?.data?.message || '삭제에 실패했습니다.')
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
      </div>
    )
  }

  if (!post) {
    return null
  }

  const readTimeMinutes = calculateReadTime(post.content)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-800">
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Actions */}
          {isAdmin && (
            <div className="mb-6 flex justify-end gap-3">
              <button
                onClick={() => router.push(`/blog/${post.slug}/edit`)}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700"
              >
                수정
              </button>
              <button
                onClick={handleDelete}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-red-700"
              >
                삭제
              </button>
            </div>
          )}

          {/* Tags */}
          <div className="mb-4 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-md bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 ring-1 ring-blue-600/20 dark:bg-blue-900/30 dark:text-blue-300 dark:ring-blue-500/30"
              >
                #{tag}
              </span>
            ))}
          </div>

          {/* Title */}
          <h1 className="mb-4 text-4xl font-bold leading-tight text-gray-900 dark:text-white">
            {post.title}
          </h1>

          {/* Summary */}
          <p className="mb-6 text-lg text-gray-600 dark:text-gray-400">
            {post.summary}
          </p>

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1.5">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              {post.authorNickname}
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: ko })}
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              {post.viewCount}
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              {readTimeMinutes}분
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="space-y-12">
          {/* Markdown Content */}
          <section className="rounded-xl border border-gray-200 bg-white px-8 py-10 shadow-sm dark:border-gray-700 dark:bg-gray-800 sm:px-12 sm:py-12">
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
              prose-hr:my-10 prose-hr:border-gray-200 dark:prose-hr:border-gray-700
              prose-table:my-6 prose-thead:bg-gray-50 dark:prose-thead:bg-gray-700 prose-th:px-4 prose-th:py-3 prose-td:px-4 prose-td:py-3">
              <ReactMarkdown>{post.content}</ReactMarkdown>
            </article>
          </section>

          {/* Like Button */}
          <section className="rounded-xl border border-gray-200 bg-white px-8 py-8 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <LikeButton
              targetType="post"
              targetId={post.id}
              initialLikeCount={post.likeCount}
            />
          </section>

          {/* Comments */}
          <section className="rounded-xl border border-gray-200 bg-white px-8 py-8 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <CommentSection targetType="post" targetId={post.id} />
          </section>
        </div>
      </main>
    </div>
  )
}
