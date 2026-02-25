'use client'

import { useState, useEffect } from 'react'
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
  const [projects, setProjects]     = useState<Project[]>(initialData.items)
  const [page, setPage]             = useState(1)
  const [totalPages, setTotalPages] = useState(initialData.totalPages)
  const [status, setStatus]         = useState('all')
  const [loading, setLoading]       = useState(false)
  const { isAdmin }                 = useAuth()

  // 필터/페이지 변경 시에만 클라이언트 fetch (초기 렌더는 SSR 데이터 사용)
  useEffect(() => {
    if (page === 1 && status === 'all') return // 초기 상태는 SSR 데이터 재사용
    loadProjects()
  }, [page, status])

  const loadProjects = async () => {
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
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto max-w-[1000px] px-5 py-10">

        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white">
              Projects
            </h1>
            <p className="mt-1 text-sm text-gray-400 dark:text-gray-500">
              포트폴리오 프로젝트 모음
            </p>
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
              onClick={() => { setStatus(f.value); setPage(1) }}
              className={`rounded-lg px-3.5 py-1.5 text-sm font-medium transition-colors ${
                status === f.value
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
              <Link
                href="/projects/new"
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
              >
                첫 프로젝트 작성하기
              </Link>
            )}
          </div>
        ) : (
          <>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {projects.map((project) => (
                <Link key={project.id} href={`/projects/${project.id}`} className="block">
                  <ProjectCard project={project} />
                </Link>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-10 flex items-center justify-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 transition-colors hover:bg-gray-50 disabled:opacity-40 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <span className="min-w-[60px] text-center text-sm text-gray-500 dark:text-gray-400">
                  {page} / {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
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
