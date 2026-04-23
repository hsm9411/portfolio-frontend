'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { getProjects, type Project } from '@/lib/api/projects'
import ProjectCard from '@/components/ProjectCard'
import ProjectCardSkeleton from '@/components/ui/ProjectCardSkeleton'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { useDebounce } from '@/hooks/useDebounce'

const STATUS_FILTERS = [
  { value: 'all',         label: '전체'   },
  { value: 'in-progress', label: '진행중' },
  { value: 'completed',   label: '완료'   },
  { value: 'archived',    label: '보관'   },
]

interface InitialData {
  items: Project[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export default function ProjectsClient({ initialData }: { initialData: InitialData }) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const pageFromUrl   = Number(searchParams.get('page'))   || 1
  const statusFromUrl = searchParams.get('status') || 'all'
  const searchFromUrl = searchParams.get('search') || ''
  const sortFromUrl   = searchParams.get('sort')   || 'latest'
  const techFromUrl   = searchParams.get('tech')   || ''

  // SSR initialData는 항상 page=1, status=all, search='', sort=latest, tech='' 기준으로 받아옴
  const isDefaultUrl = pageFromUrl === 1 && statusFromUrl === 'all' && searchFromUrl === '' && sortFromUrl === 'latest' && !techFromUrl

  const [projects, setProjects]     = useState<Project[]>(isDefaultUrl ? initialData.items : [])
  const [totalPages, setTotalPages] = useState(isDefaultUrl ? initialData.totalPages : 1)
  const [loading, setLoading]       = useState(!isDefaultUrl)
  const [searchInput, setSearchInput] = useState(searchFromUrl)
  const debouncedSearch = useDebounce(searchInput, 400)
  const { isAdmin } = useAuth()

  // 최초 마운트 시 SSR 데이터를 그대로 쓰는 경우 fetch 스킵
  const hasMounted = useRef(false)
  const isFirstDebounce = useRef(true)

  const SORT_OPTIONS = [
    { value: 'latest', label: '최신순' },
    { value: 'views',  label: '조회수' },
    { value: 'likes',  label: '좋아요' },
  ]

  const sortToParams = (sort: string): Record<string, string> => {
    if (sort === 'views') return { sortBy: 'view_count',  order: 'DESC' }
    if (sort === 'likes') return { sortBy: 'like_count',  order: 'DESC' }
    return                       { sortBy: 'created_at', order: 'DESC' }
  }

  const loadProjects = useCallback(async (page: number, status: string, search: string, sort: string, tech: string) => {
    try {
      setLoading(true)
      // tech 필터 활성 시 전체 fetch 후 클라이언트 필터링 (포트폴리오 규모상 충분)
      const params: Record<string, unknown> = { page: tech ? 1 : page, limit: tech ? 100 : 9, ...sortToParams(sort) }
      if (status !== 'all') params.status = status
      if (search) params.search = search
      const response = await getProjects(params)
      const items = tech
        ? response.items.filter((p) => p.techStack.some((t) => t.toLowerCase() === tech.toLowerCase()))
        : response.items
      setProjects(items)
      setTotalPages(tech ? 1 : response.totalPages)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true
      if (isDefaultUrl) return  // 최초 진입, SSR 데이터로 충분
    }
    loadProjects(pageFromUrl, statusFromUrl, searchFromUrl, sortFromUrl, techFromUrl)
  }, [pageFromUrl, statusFromUrl, searchFromUrl, sortFromUrl, techFromUrl, isDefaultUrl, loadProjects])

  // debounce된 검색어가 바뀌면 URL 업데이트
  useEffect(() => {
    if (isFirstDebounce.current) {
      isFirstDebounce.current = false
      return
    }
    if (debouncedSearch === searchFromUrl) return
    updateUrl(1, statusFromUrl, debouncedSearch, sortFromUrl, techFromUrl)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch])

  const updateUrl = (page: number, status: string, search: string, sort: string, tech: string) => {
    const params = new URLSearchParams()
    if (page > 1)          params.set('page',   String(page))
    if (status !== 'all')  params.set('status', status)
    if (search)            params.set('search', search)
    if (sort !== 'latest') params.set('sort',   sort)
    if (tech)              params.set('tech',   tech)
    const qs = params.toString()
    router.push(`/projects${qs ? `?${qs}` : ''}`, { scroll: false })
  }

  const handleStatusChange = (status: string) => updateUrl(1, status, searchFromUrl, sortFromUrl, techFromUrl)
  const handlePageChange   = (page: number)   => updateUrl(page, statusFromUrl, searchFromUrl, sortFromUrl, techFromUrl)
  const handleClear        = () => { setSearchInput(''); updateUrl(1, statusFromUrl, '', sortFromUrl, techFromUrl) }
  const handleTechClick    = (tech: string)   => updateUrl(1, statusFromUrl, searchFromUrl, sortFromUrl, tech)
  const handleTechClear    = () => updateUrl(1, statusFromUrl, searchFromUrl, sortFromUrl, '')

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto max-w-[1000px] px-4 py-8 sm:px-5 sm:py-10">

        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white">Projects</h1>
            <p className="mt-1 text-sm text-gray-400 dark:text-gray-500">포트폴리오 프로젝트 모음</p>
          </div>
          {isAdmin && (
            <Link
              href="/projects/new"
              className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              프로젝트 작성
            </Link>
          )}
        </div>

        {/* 검색 */}
        <div className="mb-5">
          <div className="flex gap-2">
            <select
              value={sortFromUrl}
              onChange={(e) => updateUrl(1, statusFromUrl, searchFromUrl, e.target.value, techFromUrl)}
              className="shrink-0 rounded-lg border border-gray-200 bg-white py-2.5 pl-3 pr-8 text-sm text-gray-700 transition-colors focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <div className="relative flex-1">
              {loading && searchInput ? (
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-200 border-t-blue-500" />
                </div>
              ) : (
                <svg className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              )}
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="프로젝트 검색..."
                className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 transition-colors focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500 dark:focus:border-blue-500"
              />
            </div>
            {(searchInput || searchFromUrl) && (
              <button
                type="button"
                onClick={handleClear}
                className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-500 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
              >
                초기화
              </button>
            )}
          </div>
          {searchFromUrl && (
            <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">
              <span className="font-semibold text-gray-700 dark:text-gray-300">{'"'}{searchFromUrl}{'"'}</span> 검색 결과
            </p>
          )}
        </div>

        {/* 상태 필터 — 모바일 가로 스크롤 */}
        <div className="scrollbar-hide mb-4 flex gap-2 overflow-x-auto">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => handleStatusChange(f.value)}
              className={`shrink-0 rounded-lg px-3.5 py-1.5 text-sm font-medium transition-colors ${
                statusFromUrl === f.value
                  ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
                  : 'bg-white text-gray-500 ring-1 ring-inset ring-gray-200 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700 dark:hover:bg-gray-700'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* 기술 스택 필터 pill */}
        {techFromUrl && (
          <div className="mb-4 flex items-center gap-2">
            <span className="text-xs text-gray-400 dark:text-gray-500">기술 스택</span>
            <span className="flex items-center gap-1.5 rounded-full bg-blue-100 py-1 pl-3 pr-2 text-xs font-semibold text-blue-700 dark:bg-blue-900/40 dark:text-blue-400">
              {techFromUrl}
              <button
                type="button"
                onClick={handleTechClear}
                className="flex h-4 w-4 items-center justify-center rounded-full hover:bg-blue-200 dark:hover:bg-blue-800"
                aria-label="기술 스택 필터 해제"
              >
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <ProjectCardSkeleton key={i} />
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 py-24 text-center dark:border-gray-700">
            <p className="text-sm text-gray-400 dark:text-gray-500">
              {techFromUrl
                ? `"${techFromUrl}" 기술 스택을 사용한 프로젝트가 없습니다.`
                : searchFromUrl
                  ? `"${searchFromUrl}"에 대한 결과가 없습니다.`
                  : statusFromUrl !== 'all'
                    ? '해당 상태의 프로젝트가 없습니다.'
                    : '프로젝트가 없습니다.'}
            </p>
            {isAdmin && !searchFromUrl && statusFromUrl === 'all' && !techFromUrl && (
              <Link href="/projects/new" className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
                첫 프로젝트 작성하기
              </Link>
            )}
            {(searchFromUrl || statusFromUrl !== 'all' || techFromUrl) && (
              <button
                onClick={() => { setSearchInput(''); updateUrl(1, 'all', '', sortFromUrl, '') }}
                className="mt-4 inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400"
              >
                전체 목록으로
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid gap-3 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
              {projects.map((project) => (
                <Link key={project.id} href={`/projects/${project.id}?from=list`} className="block">
                  <ProjectCard project={project} onTechClick={handleTechClick} />
                </Link>
              ))}
            </div>

            {totalPages > 1 && !techFromUrl && (
              <div className="mt-10 flex items-center justify-center gap-2">
                <button
                  onClick={() => handlePageChange(Math.max(1, pageFromUrl - 1))}
                  disabled={pageFromUrl === 1}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 transition-colors hover:bg-gray-50 disabled:opacity-40 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <span className="min-w-[60px] text-center text-sm text-gray-500 dark:text-gray-400">
                  {pageFromUrl} / {totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(Math.min(totalPages, pageFromUrl + 1))}
                  disabled={pageFromUrl === totalPages}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 transition-colors hover:bg-gray-50 disabled:opacity-40 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
