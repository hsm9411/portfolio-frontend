'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getPostBySlug, type Post } from '@/lib/api/posts'
import LikeButton from '@/components/LikeButton'
import CommentSection from '@/components/CommentSection'
import ReactMarkdown from 'react-markdown'
import { formatDistanceToNow } from 'date-fns'
import { ko } from 'date-fns/locale'

export default function BlogPostPage() {
  const params = useParams()
  const router = useRouter()
  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)

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

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
      </div>
    )
  }

  if (!post) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
          <button
            onClick={() => router.back()}
            className="mb-6 flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
          >
            ← 뒤로가기
          </button>

          {/* Tags */}
          <div className="mb-4 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-lg bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
              >
                #{tag}
              </span>
            ))}
          </div>

          {/* Title */}
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            {post.title}
          </h1>

          {/* Summary */}
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
            {post.summary}
          </p>

          {/* Meta */}
          <div className="mt-6 flex items-center gap-6 text-sm text-gray-500">
            <span className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700"></div>
              {post.authorNickname}
            </span>
            <span>
              {formatDistanceToNow(new Date(post.createdAt), {
                addSuffix: true,
                locale: ko,
              })}
            </span>
            <span className="flex items-center gap-1">
              👁️ {post.viewCount}
            </span>
            <span className="flex items-center gap-1">
              📖 {post.readTimeMinutes}분
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Markdown Content */}
        <article className="prose prose-lg max-w-none dark:prose-invert prose-headings:font-bold prose-a:text-blue-600 prose-code:rounded prose-code:bg-gray-100 prose-code:px-1 prose-code:py-0.5 prose-code:before:content-[''] prose-code:after:content-[''] prose-pre:bg-gray-900 prose-pre:text-gray-100 dark:prose-code:bg-gray-800">
          <ReactMarkdown>{post.content}</ReactMarkdown>
        </article>

        {/* Like Button */}
        <div className="mt-12 border-t border-gray-200 pt-8 dark:border-gray-700">
          <LikeButton
            targetType="post"
            targetId={post.id}
            initialLikeCount={post.likeCount}
          />
        </div>

        {/* Comments */}
        <div className="mt-8 border-t border-gray-200 pt-8 dark:border-gray-700">
          <CommentSection targetType="post" targetId={post.id} />
        </div>
      </main>
    </div>
  )
}
