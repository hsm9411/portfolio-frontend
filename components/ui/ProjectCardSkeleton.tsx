export default function ProjectCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
      {/* 썸네일 */}
      <div className="aspect-video w-full animate-pulse bg-gray-200 dark:bg-zinc-700" />

      {/* 콘텐츠 */}
      <div className="flex flex-col p-5">
        {/* 상태 배지 */}
        <div className="mb-2.5 h-[22px] w-12 animate-pulse rounded-full bg-gray-200 dark:bg-zinc-700" />
        {/* 제목 */}
        <div className="mb-2 space-y-1.5">
          <div className="h-[22px] w-full animate-pulse rounded bg-gray-200 dark:bg-zinc-700" />
          <div className="h-[22px] w-2/3 animate-pulse rounded bg-gray-200 dark:bg-zinc-700" />
        </div>
        {/* 요약 */}
        <div className="mb-3.5 space-y-1.5">
          <div className="h-4 w-full animate-pulse rounded bg-zinc-100 dark:bg-zinc-700/60" />
          <div className="h-4 w-full animate-pulse rounded bg-zinc-100 dark:bg-zinc-700/60" />
          <div className="h-4 w-4/5 animate-pulse rounded bg-zinc-100 dark:bg-zinc-700/60" />
        </div>
        {/* 기술 스택 */}
        <div className="mb-3.5 flex items-center gap-1.5">
          <div className="h-[26px] w-16 animate-pulse rounded-md bg-zinc-100 dark:bg-zinc-700/60" />
          <div className="h-[26px] w-16 animate-pulse rounded-md bg-zinc-100 dark:bg-zinc-700/60" />
          <div className="h-[26px] w-16 animate-pulse rounded-md bg-zinc-100 dark:bg-zinc-700/60" />
        </div>
        {/* 메타 */}
        <div className="flex items-center justify-between border-t border-gray-100 pt-3 dark:border-zinc-700">
          <div className="flex items-center gap-3">
            <div className="h-3 w-8 animate-pulse rounded bg-zinc-100 dark:bg-zinc-700/60" />
            <div className="h-3 w-8 animate-pulse rounded bg-zinc-100 dark:bg-zinc-700/60" />
          </div>
          <div className="h-3 w-14 animate-pulse rounded bg-zinc-100 dark:bg-zinc-700/60" />
        </div>
      </div>
    </div>
  )
}
