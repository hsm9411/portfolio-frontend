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

  // SSR initialData는 항상 page=1, status=all, search='' 기준으로 받아옴
  const isDefaultUrl = pageFromUrl === 1 && statusFromUrl === 'all' && searchFromUrl === ''

  const [projects, setProjects]     = useState<Project[]>(isDefaultUrl ? initialData.items : [])
  const [totalPages, setTotalPages] = useState(isDefaultUrl ? initialData.totalPages : 1)
  const [loading, setLoading]       = useState(!isDefaultUrl)
  const [searchInput, setSearchInput] = useState(searchFromUrl)
  const debouncedSearch = useDebounce(searchInput, 400)
  const { isAdmin } = useAuth()

  // 최초 마운트 시 SSR 데이터를 그대로 쓰는 경우 fetch 스킵
  const hasMounted = useRef(false)
  const isFirstDebounce = useRef(true)

  const loadProjects = useCallback(async (page: number, status: string, search: string) => {
    try {
      setLoading(true)
      const params: Record<string, unknown> = { page, limit: 9, sortBy: 'created_at', order: 'DESC' }
      if (status !== 'all') params.status = status
      if (search) params.search = search
      const response = await getProjects(params)
      setProjects(response.items)
      setTotalPages(response.totalPages)
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
    loadProjects(pageFromUrl, statusFromUrl, searchFromUrl)
  }, [pageFromUrl, statusFromUrl, searchFromUrl, isDefaultUrl, loadProjects])

  // debounce된 검색어가 바뀌면 URL 업데이트
  useEffect(() => {
    if (isFirstDebounce.current) {
      isFirstDebounce.current = false
      return
    }
    if (debouncedSearch === searchFromUrl) return
    updateUrl(1, statusFromUrl, debouncedSearch)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch])

  const updateUrl = (page: number, status: string, search: string) => {
    const params = new URLSearchParams()
    if (page > 1)         params.set('page', String(page))
    if (status !== 'all') params.set('status', status)
    if (search)           params.set('search', search)
    const qs = params.toString()
    router.push(`/projects${qs ? `?${qs}` : ''}`, { scroll: false })
  }

  const handleStatusChange = (status: string) => updateUrl(1, status, searchFromUrl)
  const handlePageChange   = (page: number)   => updateUrl(page, statusFromUrl, searchFromUrl)
  const handleClear        = () => { setSearchInput(''); updateUrl(1, statusFromUrl, '') }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto max-w-[1000px] px-5 py-10">

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

        {/* 상태 필터 */}
        <div className="mb-7 flex flex-wrap gap-2">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => handleStatusChange(f.value)}
              className={`rounded-lg px-3.5 py-1.5 text-sm font-medium transition-colors ${
                statusFromUrl === f.value
                  ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
                  : 'bg-white text-gray-500 ring-1 ring-inset ring-gray-200 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700 dark:hover:bg-gray-700'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <ProjectCardSkeleton key={i} />
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 py-24 text-center dark:border-gray-700">
            <p className="text-sm text-gray-400 dark:text-gray-500">
              {searchFromUrl
                ? `"${searchFromUrl}"에 대한 결과가 없습니다.`
                : statusFromUrl !== 'all'
                  ? '해당 상태의 프로젝트가 없습니다.'
                  : '프로젝트가 없습니다.'}
            </p>
            {isAdmin && !searchFromUrl && statusFromUrl === 'all' && (
              <Link href="/projects/new" className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
                첫 프로젝트 작성하기
              </Link>
            )}
            {(searchFromUrl || statusFromUrl !== 'all') && (
              <button
                onClick={() => { setSearchInput(''); updateUrl(1, 'all', '') }}
                className="mt-4 inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400"
              >
                전체 목록으로
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {projects.map((project) => (
                <Link key={project.id} href={`/projects/${project.id}?from=list`} className="block">
                  <ProjectCard project={project} />
                </Link>
              ))}
            </div>

            {totalPages > 1 && (
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
