import type { Post } from '@/lib/api/posts'
import { formatDistanceToNow } from 'date-fns'
import { ko } from 'date-fns/locale'

interface PostCardProps {
  post: Post
}

// 읽기 시간 계산 (한국어 기준: 분당 약 500자)
const calculateReadTime = (content: string): number => {
  const wordsPerMinute = 500
  const wordCount = content.length
  return Math.max(1, Math.ceil(wordCount / wordsPerMinute))
}

export default function PostCard({ post }: PostCardProps) {
  const readTimeMinutes = calculateReadTime(post.content)

  return (
    <article className="group rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md hover:border-blue-200 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-blue-800">
      {/* Tags */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {post.tags.slice(0, 3).map((tag) => (
          <span
            key={tag}
            className="rounded-md bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 ring-1 ring-blue-600/20 dark:bg-blue-900/30 dark:text-blue-300 dark:ring-blue-500/30"
          >
            #{tag}
          </span>
        ))}
        {post.tags.length > 3 && (
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
            +{post.tags.length - 3}
          </span>
        )}
      </div>

      {/* Title */}
      <h2 className="mb-3 text-2xl font-bold text-gray-900 transition-colors group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
        {post.title}
      </h2>

      {/* Summary */}
      <p className="mb-5 line-clamp-2 leading-relaxed text-gray-600 dark:text-gray-400">
        {post.summary}
      </p>

      {/* Meta Info */}
      <div className="flex items-center justify-between border-t border-gray-200 pt-4 dark:border-gray-700">
        <div className="flex items-center gap-5 text-sm text-gray-500 dark:text-gray-400">
          <span className="flex items-center gap-1.5">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            {post.viewCount}
          </span>
          <span className="flex items-center gap-1.5">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            {post.likeCount}
          </span>
          <span className="flex items-center gap-1.5">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {readTimeMinutes}분
          </span>
        </div>
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
          {formatDistanceToNow(new Date(post.createdAt), {
            addSuffix: true,
            locale: ko,
          })}
        </span>
      </div>
    </article>
  )
}
