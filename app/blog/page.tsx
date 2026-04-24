import type { Metadata } from 'next'
import { Suspense } from 'react'
import { fetchPosts } from '@/lib/api/server'
import BlogClient from './BlogClient'

export const metadata: Metadata = {
  title: 'Blog',
  description: '개발 경험과 기술적 인사이트를 담은 블로그 포스트 모음입니다.',
  openGraph: {
    title: 'Blog | hsm',
    description: '개발 경험과 기술적 인사이트를 담은 블로그 포스트 모음입니다.',
    url: '/blog',
  },
}

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
        <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-gray-200 border-t-teal-600" />
      </div>
    }>
      <BlogClient initialData={initialData} />
    </Suspense>
  )
}
