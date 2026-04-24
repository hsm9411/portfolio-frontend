'use client'

import Image from 'next/image'
import type { Project } from '@/lib/api/projects'
import { formatDistanceToNow } from 'date-fns'
import { ko } from 'date-fns/locale'
import { getDeviconUrls, getTechGradient } from '@/lib/utils/devicon'

interface ProjectCardProps {
  project: Project
  onTechClick?: (tech: string) => void
}

const statusConfig = {
  completed: { label: '완료', className: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-900/30 dark:text-emerald-400 dark:ring-emerald-500/30' },
  'in-progress': { label: '진행중', className: 'bg-teal-50 text-teal-700 ring-teal-600/20 dark:bg-teal-900/30 dark:text-teal-400 dark:ring-teal-500/30' },
  archived: { label: '보관', className: 'bg-gray-100 text-gray-500 ring-gray-500/20 dark:bg-gray-700 dark:text-gray-400 dark:ring-gray-500/30' },
}

export default function ProjectCard({ project, onTechClick }: ProjectCardProps) {
  const status = statusConfig[project.status as keyof typeof statusConfig] ?? statusConfig.archived
  const deviconUrls = getDeviconUrls(project.techStack, 3)
  const gradient = getTechGradient(project.techStack)

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:hover:border-gray-600">

      {/* 썸네일 — 모바일에서 2:1 비율로 축소, sm 이상에서 16:9 */}
      <div className="relative aspect-[2/1] w-full overflow-hidden bg-gray-100 sm:aspect-video dark:bg-gray-700">
        {project.thumbnailUrl ? (
          <Image
            src={project.thumbnailUrl}
            alt={project.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-contain"
          />
        ) : (
          /* 플레이스홀더: 그라디언트 배경 + devicon 아이콘 */
          <div className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${gradient}`}>
            {deviconUrls.length > 0 ? (
              <div className="flex items-center gap-3">
                {deviconUrls.map((url, i) => (
                  <div
                    key={i}
                    className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 p-2 backdrop-blur-sm"
                    style={{ opacity: 1 - i * 0.2 }}
                  >
                    <Image
                      src={url}
                      alt=""
                      width={32}
                      height={32}
                      className="object-contain brightness-0 invert"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                    />
                  </div>
                ))}
              </div>
            ) : (
              /* devicon도 없으면 텍스트 이니셜 */
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
                <span className="text-2xl font-bold text-white">
                  {project.title.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 콘텐츠 — 각 영역 고정 높이로 카드 크기 통일 */}
      <div className="flex flex-col p-4 sm:p-5">

        {/* 상태 배지 — h-[22px] 고정 */}
        <div className="mb-2.5 flex h-[22px] items-center">
          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${status.className}`}>
            {status.label}
          </span>
        </div>

        {/* 제목 — 최대 2줄. sm 이상 다열 그리드에서만 고정 높이로 행 정렬 */}
        <h3 className="mb-2 line-clamp-2 overflow-hidden text-base font-bold leading-[1.4] text-gray-900 transition-colors group-hover:text-teal-600 dark:text-white dark:group-hover:text-teal-400 sm:h-[46px]">
          {project.title}
        </h3>

        {/* 요약 — 최대 3줄. sm 이상 다열 그리드에서만 고정 높이로 행 정렬 */}
        <p className="mb-3.5 line-clamp-3 text-sm leading-[1.5] text-gray-500 dark:text-gray-400 sm:h-[63px]">
          {project.summary}
        </p>

        {/* 기술 스택 — 1줄 고정 h-[26px] */}
        <div className="mb-3.5 flex h-[26px] items-center gap-1.5">
          {project.techStack.slice(0, 3).map((tech) =>
            onTechClick ? (
              <button
                key={tech}
                type="button"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); onTechClick(tech) }}
                className="shrink-0 rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600 transition-colors hover:bg-teal-100 hover:text-teal-700 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-teal-900/40 dark:hover:text-teal-400"
              >
                {tech}
              </button>
            ) : (
              <span key={tech} className="shrink-0 rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                {tech}
              </span>
            )
          )}
          {project.techStack.length > 3 && (
            <span className="shrink-0 rounded-md bg-teal-50 px-2 py-0.5 text-xs font-semibold text-teal-500 dark:bg-teal-900/30 dark:text-teal-400">
              +{project.techStack.length - 3}
            </span>
          )}
        </div>

        {/* 메타 정보 */}
        <div className="flex items-center justify-between border-t border-gray-100 pt-3 dark:border-gray-700">
          <div className="flex items-center gap-3.5 text-xs text-gray-400 dark:text-gray-500">
            <span className="flex items-center gap-1">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              {project.viewCount.toLocaleString()}
            </span>
            <span className="flex items-center gap-1">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              {project.likeCount.toLocaleString()}
            </span>
          </div>
          <span className="text-xs text-gray-400 dark:text-gray-500">
            {formatDistanceToNow(new Date(project.createdAt), { addSuffix: true, locale: ko })}
          </span>
        </div>
      </div>
    </div>
  )
}
