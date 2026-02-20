'use client'

import { useState, useEffect } from 'react'
import { getPosts, type Post } from '@/lib/api/posts'
import PostCard from '@/components/PostCard'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'

export default function BlogPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const { isAdmin } = useAuth()

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
      <header className="border-b border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-800">
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                📝 Blog
              </h1>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                개발 블로그 및 기술 포스팅
              </p>
            </div>
            {isAdmin && (
              <Link
                href="/blog/new"
                className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700"
              >
                + 포스트 작성
              </Link>
            )}
          </div>

          {/* Search */}
          <form onSubmit={handleSearch} className="mt-6">
            <div className="flex gap-3">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="검색어를 입력하세요..."
                className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
              <button
                type="submit"
                className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700"
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
                  className="rounded-lg bg-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                >
                  초기화
                </button>
              )}
            </div>
          </form>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
          </div>
        ) : posts.length === 0 ? (
          <div className="rounded-xl bg-white p-12 text-center shadow-sm dark:bg-gray-800">
            <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="mt-4 text-gray-500 dark:text-gray-400">
              {searchTerm ? '검색 결과가 없습니다.' : '포스트가 없습니다.'}
            </p>
            {isAdmin && !searchTerm && (
              <Link
                href="/blog/new"
                className="mt-6 inline-block rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700"
              >
                첫 포스트 작성하기
              </Link>
            )}
          </div>
        ) : (
          <>
            {/* Posts Grid */}
            <div className="flex flex-col gap-5">
              {posts.map((post) => (
                <Link key={post.id} href={`/blog/${post.id}`} className="block">
                  <PostCard post={post} />
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-10 flex justify-center gap-3">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition-colors hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  이전
                </button>
                <span className="flex items-center px-4 text-sm font-medium text-gray-600 dark:text-gray-400">
                  {page} / {totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition-colors hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
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
