'use client'

import { useState, useEffect } from 'react'
import { getProjects, type Project } from '@/lib/api/projects'
import ProjectCard from '@/components/ProjectCard'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [status, setStatus] = useState<string>('all')
  const { isAdmin } = useAuth()

  useEffect(() => {
    loadProjects()
  }, [page, status])

  const loadProjects = async () => {
    try {
      setLoading(true)
      const params: any = {
        page,
        limit: 9,
        sortBy: 'created_at',
        order: 'DESC' as const
      }
      
      if (status !== 'all') {
        params.status = status
      }

      const response = await getProjects(params)
      setProjects(response.items)
      setTotalPages(response.totalPages)
    } catch (error) {
      console.error('Failed to load projects:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Projects
              </h1>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                포트폴리오 프로젝트 모음
              </p>
            </div>
            <div className="flex gap-3">
              {isAdmin && (
                <Link
                  href="/projects/new"
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                  + 프로젝트 작성
                </Link>
              )}
              <Link
                href="/"
                className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              >
                홈으로
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Filters */}
        <div className="mb-6 flex gap-2">
          <button
            onClick={() => { setStatus('all'); setPage(1); }}
            className={`rounded-lg px-4 py-2 text-sm font-medium ${
              status === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300'
            }`}
          >
            전체
          </button>
          <button
            onClick={() => { setStatus('in-progress'); setPage(1); }}
            className={`rounded-lg px-4 py-2 text-sm font-medium ${
              status === 'in-progress'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300'
            }`}
          >
            진행중
          </button>
          <button
            onClick={() => { setStatus('completed'); setPage(1); }}
            className={`rounded-lg px-4 py-2 text-sm font-medium ${
              status === 'completed'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300'
            }`}
          >
            완료
          </button>
        </div>

        {/* Projects Grid */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
          </div>
        ) : projects.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-gray-500">프로젝트가 없습니다.</p>
            {isAdmin && (
              <Link
                href="/projects/new"
                className="mt-4 inline-block rounded-lg bg-blue-600 px-6 py-3 text-sm font-medium text-white hover:bg-blue-700"
              >
                첫 프로젝트 작성하기
              </Link>
            )}
          </div>
        ) : (
          <>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {projects.map((project) => (
                <Link key={project.id} href={`/projects/${project.id}`}>
                  <ProjectCard project={project} />
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 dark:bg-gray-800 dark:text-gray-300"
                >
                  이전
                </button>
                <span className="flex items-center px-4 text-sm text-gray-600 dark:text-gray-400">
                  {page} / {totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 dark:bg-gray-800 dark:text-gray-300"
                >
                  다음
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
