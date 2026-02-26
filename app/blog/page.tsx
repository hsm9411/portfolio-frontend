import { Suspense } from 'react'
import { fetchPosts } from '@/lib/api/server'
import BlogClient from './BlogClient'

export default async function BlogPage() {
  let initialData = { items: [], total: 0, page: 1, pageSize: 10, totalPages: 1 }

  try {
    initialData = await fetchPosts({ page: 1, limit: 10 })
  } catch (e) {
    console.error('BlogPage SSR fetch failed, falling back to client fetch', e)
  }

  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-gray-200 border-t-blue-600" />
      </div>
    }>
      <BlogClient initialData={initialData} />
    </Suspense>
  )
}
