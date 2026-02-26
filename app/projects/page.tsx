import { Suspense } from 'react'
import { fetchProjects } from '@/lib/api/server'
import ProjectsClient from './ProjectsClient'

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
