export default function PostCardSkeleton() {
  return (
    <div className="flex overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
      {/* 텍스트 영역 */}
      <div className="flex min-w-0 flex-1 flex-col py-3.5 pl-4 pr-3 sm:py-4 sm:pl-5 sm:pr-4">
        {/* 카테고리 + 태그 */}
        <div className="flex items-center gap-1.5">
          <div className="h-5 w-16 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700" />
          <div className="h-5 w-12 animate-pulse rounded-md bg-gray-200 dark:bg-gray-700" />
        </div>
        {/* 제목 */}
        <div className="mt-2 space-y-1.5">
          <div className="h-4 w-full animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
          <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
        </div>
        {/* 요약 */}
        <div className="mt-2 space-y-1.5">
          <div className="h-3.5 w-full animate-pulse rounded bg-gray-100 dark:bg-gray-700/60" />
          <div className="h-3.5 w-5/6 animate-pulse rounded bg-gray-100 dark:bg-gray-700/60" />
        </div>
        {/* 메타 */}
        <div className="mt-auto flex items-center gap-3 pt-2">
          <div className="h-3 w-8 animate-pulse rounded bg-gray-100 dark:bg-gray-700/60" />
          <div className="h-3 w-8 animate-pulse rounded bg-gray-100 dark:bg-gray-700/60" />
          <div className="h-3 w-8 animate-pulse rounded bg-gray-100 dark:bg-gray-700/60" />
          <div className="ml-auto h-3 w-14 animate-pulse rounded bg-gray-100 dark:bg-gray-700/60" />
        </div>
      </div>
      {/* 썸네일 자리 */}
      <div className="w-[110px] shrink-0 animate-pulse bg-gray-200 dark:bg-gray-700 sm:w-[150px] md:w-[170px]" />
    </div>
  )
}
