import type { Metadata } from 'next'
import { Suspense } from 'react'
import { fetchProjects } from '@/lib/api/server'
import ProjectsClient from './ProjectsClient'

export const metadata: Metadata = {
  title: 'Projects',
  description: '개인 및 팀 프로젝트 모음입니다. 사용 기술과 구현 과정을 확인해보세요.',
  openGraph: {
    title: 'Projects | hsm',
    description: '개인 및 팀 프로젝트 모음입니다. 사용 기술과 구현 과정을 확인해보세요.',
    url: '/projects',
  },
}

export default async function ProjectsPage() {
  let initialData = { items: [], total: 0, page: 1, pageSize: 9, totalPages: 1 }

  try {
    initialData = await fetchProjects({ page: 1, limit: 9, sortBy: 'created_at', order: 'DESC' })
  } catch (e) {
    console.error('ProjectsPage SSR fetch failed, falling back to client fetch', e)
  }

  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-gray-200 border-t-blue-600" />
      </div>
    }>
      <ProjectsClient initialData={initialData} />
    </Suspense>
  )
}
