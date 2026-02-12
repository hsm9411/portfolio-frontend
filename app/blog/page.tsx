'use client'

import { useState, useEffect } from 'react'
import { getPosts, type Post } from '@/lib/api/posts'
import PostCard from '@/components/PostCard'
import Link from 'next/link'

export default function BlogPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [searchInput, setSearchInput] = useState('')

  useEffect(() => {
    loadPosts()
  }, [page, searchTerm])

  const loadPosts = async () => {
    try {
      setLoading(true)
      const params: any = {
        page,
        limit: 10,
      }

      if (searchTerm) {
        params.search = searchTerm
      }

      const response = await getPosts(params)
      setPosts(response.items)
      setTotalPages(response.totalPages)
    } catch (error) {
      console.error('Failed to load posts:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearchTerm(searchInput)
    setPage(1)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Blog
              </h1>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                개발 블로그 및 기술 포스팅
              </p>
            </div>
            <Link
              href="/"
              className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            >
              홈으로
            </Link>
          </div>

          {/* Search */}
          <form onSubmit={handleSearch} className="mt-6">
            <div className="flex gap-2">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="검색어를 입력하세요..."
                className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              />
              <button
                type="submit"
                className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                검색
              </button>
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm('')
                    setSearchInput('')
                    setPage(1)
                  }}
                  className="rounded-lg bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300"
                >
                  초기화
                </button>
              )}
            </div>
          </form>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
          </div>
        ) : posts.length === 0 ? (
          <div className="py-12 text-center text-gray-500">
            {searchTerm ? '검색 결과가 없습니다.' : '포스트가 없습니다.'}
          </div>
        ) : (
          <>
            <div className="space-y-6">
              {posts.map((post) => (
                <Link key={post.id} href={`/blog/${post.slug}`}>
                  <PostCard post={post} />
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
