import { fetchPosts } from '@/lib/api/server'
import BlogClient from './BlogClient'

export default async function BlogPage() {
  let initialData = { items: [], total: 0, page: 1, pageSize: 10, totalPages: 1 }

  try {
    initialData = await fetchPosts({ page: 1, limit: 10 })
  } catch (e) {
    console.error('BlogPage SSR fetch failed, falling back to client fetch', e)
  }

  return <BlogClient initialData={initialData} />
}
