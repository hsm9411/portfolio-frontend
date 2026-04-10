'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { getProjects, type Project } from '@/lib/api/projects'
import ProjectCard from '@/components/ProjectCard'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'

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

  const [projects, setProjects]     = useState<Project[]>(
    pageFromUrl === 1 && statusFromUrl === 'all' ? initialData.items : []
  )
  const [totalPages, setTotalPages] = useState(
    pageFromUrl === 1 && statusFromUrl === 'all' ? initialData.totalPages : 1
  )
  const [loading, setLoading]       = useState(
    !(pageFromUrl === 1 && statusFromUrl === 'all')
  )
  const { isAdmin } = useAuth()

  /**
   * 최초 마운트 여부 추적
   *
   * 문제 원인:
   *   useEffect 내부에서 `pageFromUrl === 1 && statusFromUrl === 'all'` 조건으로
   *   fetch를 스킵했는데, 이 조건이 두 가지 상황을 구분하지 못한다.
   *
   *   1) 최초 진입 → SSR 데이터 그대로 써야 하므로 fetch 스킵 (의도된 동작)
   *   2) 다른 필터 → 전체 탭으로 복귀 → 반드시 fetch 해야 하는데 스킵됨 (버그)
   *
   *   URL 조건만으로는 두 경우를 구분할 수 없으므로,
   *   `isInitialRender` ref로 마운트 첫 실행 여부를 추적한다.
   *   초기 진입이면 스킵, 이후 URL이 변경되어 effect가 재실행되면 항상 fetch.
   */
  const isInitialRender = useRef(true)

  const loadProjects = useCallback(async (page: number, status: string) => {
    try {
      setLoading(true)
      const params: Record<string, unknown> = { page, limit: 9, sortBy: 'created_at', order: 'DESC' }
      if (status !== 'all') params.status = status
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
    // 최초 마운트: SSR initialData 그대로 사용
    // 단, URL에 이미 필터/페이지가 있으면 (직접 URL 입력, 뒤로가기 복원 등) fetch 필요
    if (isInitialRender.current) {
      isInitialRender.current = false
      if (pageFromUrl === 1 && statusFromUrl === 'all') {
        // SSR 데이터로 충분한 초기 상태 — fetch 스킵
        return
      }
      // URL에 필터/페이지가 있는 상태로 최초 진입 → fetch 필요
    }

    // 마운트 이후 URL 변경 시 항상 fetch
    // (전체 탭 복귀 포함)
    loadProjects(pageFromUrl, statusFromUrl)
  }, [pageFromUrl, statusFromUrl, loadProjects])

  const updateUrl = (page: number, status: string) => {
    const params = new URLSearchParams()
    if (page > 1)         params.set('page', String(page))
    if (status !== 'all') params.set('status', status)
    const qs = params.toString()
    router.push(`/projects${qs ? `?${qs}` : ''}`, { scroll: false })
  }

  const handleStatusChange = (status: string) => updateUrl(1, status)
  const handlePageChange   = (page: number)   => updateUrl(page, statusFromUrl)

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
          <div className="flex justify-center py-24">
            <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-gray-200 border-t-blue-600" />
          </div>
        ) : projects.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 py-24 text-center dark:border-gray-700">
            <p className="text-sm text-gray-400 dark:text-gray-500">프로젝트가 없습니다.</p>
            {isAdmin && (
              <Link href="/projects/new" className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
                첫 프로젝트 작성하기
              </Link>
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
