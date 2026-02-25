'use client'

import { useState, useEffect } from 'react'
import { getPosts, type Post } from '@/lib/api/posts'
import PostCard from '@/components/PostCard'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'

interface InitialData {
  items: Post[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export default function BlogClient({ initialData }: { initialData: InitialData }) {
  const [posts, setPosts]             = useState<Post[]>(initialData.items)
  const [page, setPage]               = useState(1)
  const [totalPages, setTotalPages]   = useState(initialData.totalPages)
  const [searchTerm, setSearchTerm]   = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [loading, setLoading]         = useState(false)
  const { isAdmin }                   = useAuth()

  // 검색/페이지 변경 시에만 클라이언트 fetch
  useEffect(() => {
    if (page === 1 && searchTerm === '') return // 초기 상태는 SSR 데이터 재사용
    loadPosts()
  }, [page, searchTerm])

  const loadPosts = async () => {
    try {
      setLoading(true)
      const params: Record<string, unknown> = { page, limit: 10 }
      if (searchTerm) params.search = searchTerm
      const response = await getPosts(params)
      setPosts(response.items)
      setTotalPages(response.totalPages)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearchTerm(searchInput)
    setPage(1)
  }

  const handleClear = () => {
    setSearchTerm('')
    setSearchInput('')
    setPage(1)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto max-w-[1000px] px-5 py-10">

        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white">
              Blog
            </h1>
            <p className="mt-1 text-sm text-gray-400 dark:text-gray-500">
              개발 블로그 및 기술 포스팅
            </p>
          </div>
          {isAdmin && (
            <Link
              href="/blog/new"
              className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              포스트 작성
            </Link>
          )}
        </div>

        <form onSubmit={handleSearch} className="mb-7">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <svg className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="제목 또는 내용으로 검색..."
                className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 transition-colors focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500 dark:focus:border-blue-500"
              />
            </div>
            <button
              type="submit"
              className="rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gray-700 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100"
            >
              검색
            </button>
            {searchTerm && (
              <button
                type="button"
                onClick={handleClear}
                className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-500 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
              >
                초기화
              </button>
            )}
          </div>
          {searchTerm && (
            <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">
              <span className="font-semibold text-gray-700 dark:text-gray-300">"{searchTerm}"</span> 검색 결과
            </p>
          )}
        </form>

        {loading ? (
          <div className="flex justify-center py-24">
            <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-gray-200 border-t-blue-600" />
          </div>
        ) : posts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 py-24 text-center dark:border-gray-700">
            <p className="text-sm text-gray-400 dark:text-gray-500">
              {searchTerm ? `"${searchTerm}"에 대한 결과가 없습니다.` : '포스트가 없습니다.'}
            </p>
            {isAdmin && !searchTerm && (
              <Link
                href="/blog/new"
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
              >
                첫 포스트 작성하기
              </Link>
            )}
            {searchTerm && (
              <button
                onClick={handleClear}
                className="mt-4 inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400"
              >
                전체 목록으로
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-4">
              {posts.map((post) => (
                <Link key={post.id} href={`/blog/${post.id}`} className="block">
                  <PostCard post={post} />
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
