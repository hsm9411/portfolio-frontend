import type { Post } from '@/lib/api/posts'
import { formatDistanceToNow } from 'date-fns'
import { ko } from 'date-fns/locale'

interface PostCardProps {
  post: Post
}

const categoryConfig: Record<string, { label: string; className: string }> = {
  tutorial: { label: '튜토리얼', className: 'bg-violet-50 text-violet-700 ring-violet-600/20 dark:bg-violet-900/30 dark:text-violet-300 dark:ring-violet-500/30' },
  essay: { label: '에세이', className: 'bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-900/30 dark:text-amber-300 dark:ring-amber-500/30' },
  review: { label: '리뷰', className: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-900/30 dark:text-emerald-300 dark:ring-emerald-500/30' },
  news: { label: '뉴스', className: 'bg-sky-50 text-sky-700 ring-sky-600/20 dark:bg-sky-900/30 dark:text-sky-300 dark:ring-sky-500/30' },
}

const calcReadTime = (content: string) => Math.max(1, Math.ceil(content.length / 500))

export default function PostCard({ post }: PostCardProps) {
  const category = categoryConfig[post.category] ?? { label: post.category, className: 'bg-gray-100 text-gray-600 ring-gray-500/20 dark:bg-gray-700 dark:text-gray-400' }
  const readTime = post.readingTime ?? calcReadTime(post.content)

  return (
    <article className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:hover:border-gray-600">
      <div className="flex gap-5">
        {/* 콘텐츠 */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* 카테고리 + 태그 */}
          <div className="mb-2.5 flex flex-wrap items-center gap-1.5">
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${category.className}`}>
              {category.label}
            </span>
            {post.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500 dark:bg-gray-700 dark:text-gray-400"
              >
                #{tag}
              </span>
            ))}
            {post.tags.length > 2 && (
              <span className="text-xs text-gray-400">+{post.tags.length - 2}</span>
            )}
          </div>

          {/* 제목 */}
          <h2 className="mb-1.5 text-lg font-bold leading-snug text-gray-900 transition-colors group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
            {post.title}
          </h2>

          {/* 요약 */}
          <p className="mb-4 line-clamp-2 flex-1 text-sm leading-relaxed text-gray-500 dark:text-gray-400">
            {post.summary}
          </p>

          {/* 메타 */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-400 dark:text-gray-500">
            <span className="flex items-center gap-1">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              {post.viewCount.toLocaleString()}
            </span>
            <span className="flex items-center gap-1">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              {post.likeCount.toLocaleString()}
            </span>
            <span className="flex items-center gap-1">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {readTime}분 읽기
            </span>
            <span className="ml-auto">
              {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: ko })}
            </span>
          </div>
        </div>
      </div>
    </article>
  )
}
