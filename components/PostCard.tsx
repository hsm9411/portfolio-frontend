import type { Post } from '@/lib/api/posts'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { ko } from 'date-fns/locale'

interface PostCardProps {
  post: Post
}

export default function PostCard({ post }: PostCardProps) {
  return (
    <article className="rounded-lg border border-gray-200 bg-white p-6 transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800">
      <div className="mb-3 flex items-center gap-2">
        {post.tags.slice(0, 3).map((tag) => (
          <span
            key={tag}
            className="rounded bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
          >
            #{tag}
          </span>
        ))}
        {post.tags.length > 3 && (
          <span className="text-xs text-gray-500">+{post.tags.length - 3}</span>
        )}
      </div>

      <h2 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">
        {post.title}
      </h2>

      <p className="mb-4 line-clamp-2 text-sm text-gray-600 dark:text-gray-400">
        {post.summary}
      </p>

      <div className="flex items-center justify-between border-t border-gray-200 pt-4 text-sm text-gray-500 dark:border-gray-700">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            👁️ {post.viewCount}
          </span>
          <span className="flex items-center gap-1">
            ❤️ {post.likeCount}
          </span>
          <span className="flex items-center gap-1">
            📖 {post.readTimeMinutes}분
          </span>
        </div>
        <span className="text-xs">
          {formatDistanceToNow(new Date(post.createdAt), {
            addSuffix: true,
            locale: ko,
          })}
        </span>
      </div>
    </article>
  )
}
