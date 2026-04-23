'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { getPosts, type Post } from '@/lib/api/posts'
import PostCard from '@/components/PostCard'
import PostCardSkeleton from '@/components/ui/PostCardSkeleton'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { useDebounce } from '@/hooks/useDebounce'

interface InitialData {
  items: Post[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export default function BlogClient({ initialData }: { initialData: InitialData }) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const pageFromUrl     = Number(searchParams.get('page'))     || 1
  const searchFromUrl   = searchParams.get('search')   || ''
  const categoryFromUrl = searchParams.get('category') || ''
  const sortFromUrl     = searchParams.get('sort')     || 'latest'

  // SSR initialData는 항상 page=1, 검색/카테고리/정렬 없음 기준으로 받아옴
  const isDefaultUrl = pageFromUrl === 1 && searchFromUrl === '' && categoryFromUrl === '' && sortFromUrl === 'latest'

  const [posts, setPosts]             = useState<Post[]>(isDefaultUrl ? initialData.items : [])
  const [totalPages, setTotalPages]   = useState(isDefaultUrl ? initialData.totalPages : 1)
  const [loading, setLoading]         = useState(!isDefaultUrl)
  const [searchInput, setSearchInput] = useState(searchFromUrl)
  const debouncedSearch = useDebounce(searchInput, 400)
  const { isAdmin } = useAuth()

  // 최초 마운트 시 SSR 데이터를 그대로 쓰는 경우 fetch 스킵
  const hasMounted = useRef(false)
  const isFirstDebounce = useRef(true)

  const SORT_OPTIONS = [
    { value: 'latest', label: '최신순' },
    { value: 'views',  label: '조회수' },
  ]

  const loadPosts = useCallback(async (page: number, search: string, category: string, sort: string) => {
    try {
      setLoading(true)
      const params: Record<string, unknown> = { page, limit: 10 }
      if (search)   params.search   = search
      if (category) params.category = category
      if (sort === 'views') { params.sortBy = 'view_count'; params.order = 'DESC' }
      const response = await getPosts(params)
      setPosts(response.items)
      setTotalPages(response.totalPages)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true
      if (isDefaultUrl) return  // 최초 진입, SSR 데이터로 충분
    }
    loadPosts(pageFromUrl, searchFromUrl, categoryFromUrl, sortFromUrl)
  }, [pageFromUrl, searchFromUrl, categoryFromUrl, sortFromUrl, isDefaultUrl, loadPosts])

  // debounce된 검색어가 바뀌면 URL 업데이트 (최초 마운트 시 스킵)
  useEffect(() => {
    if (isFirstDebounce.current) {
      isFirstDebounce.current = false
      return
    }
    if (debouncedSearch === searchFromUrl) return
    updateUrl(1, debouncedSearch, categoryFromUrl, sortFromUrl)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch])

  const updateUrl = (page: number, search: string, category: string, sort: string) => {
    const params = new URLSearchParams()
    if (page > 1)          params.set('page',     String(page))
    if (search)            params.set('search',   search)
    if (category)          params.set('category', category)
    if (sort !== 'latest') params.set('sort',     sort)
    const qs = params.toString()
    router.push(`/blog${qs ? `?${qs}` : ''}`, { scroll: false })
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    updateUrl(1, searchInput, categoryFromUrl, sortFromUrl)
  }

  const handleClear = () => {
    setSearchInput('')
    updateUrl(1, '', categoryFromUrl, sortFromUrl)
  }

  const CATEGORIES = [
    { value: '',         label: '전체' },
    { value: 'tutorial', label: '튜토리얼' },
    { value: 'essay',    label: '에세이' },
    { value: 'review',   label: '리뷰' },
    { value: 'news',     label: '뉴스' },
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto max-w-[1000px] px-4 py-6 sm:px-5 sm:py-10">

        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white">Blog</h1>
            <p className="mt-1 text-sm text-gray-400 dark:text-gray-500">개발 블로그 및 기술 포스팅</p>
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

        {/* 카테고리 필터 — 모바일 가로 스크롤 */}
        <div className="scrollbar-hide mb-5 flex gap-2 overflow-x-auto">
          {CATEGORIES.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => updateUrl(1, searchFromUrl, value, sortFromUrl)}
              className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                categoryFromUrl === value
                  ? 'bg-blue-600 text-white'
                  : 'border border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSearch} className="mb-7">
          <div className="flex gap-2">
            <select
              value={sortFromUrl}
              onChange={(e) => updateUrl(1, searchFromUrl, categoryFromUrl, e.target.value)}
              className="shrink-0 rounded-lg border border-gray-200 bg-white py-2.5 pl-3 pr-8 text-sm text-gray-700 transition-colors focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <div className="relative flex-1">
              {loading && searchInput ? (
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-200 border-t-blue-500" />
                </div>
              ) : (
                <svg className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              )}
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="제목 또는 내용으로 검색..."
                className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 transition-colors focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500 dark:focus:border-blue-500"
              />
            </div>
            {(searchInput || searchFromUrl) && (
              <button type="button" onClick={handleClear} className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-500 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700">
                초기화
              </button>
            )}
          </div>
          {searchFromUrl && (
            <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">
              <span className="font-semibold text-gray-700 dark:text-gray-300">{'"'}{searchFromUrl}{'"'}</span> 검색 결과
            </p>
          )}
        </form>

        {loading ? (
          <div className="flex flex-col gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <PostCardSkeleton key={i} />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 py-24 text-center dark:border-gray-700">
            <p className="text-sm text-gray-400 dark:text-gray-500">
              {searchFromUrl
                ? `"${searchFromUrl}"에 대한 결과가 없습니다.`
                : categoryFromUrl
                  ? `해당 카테고리의 포스트가 없습니다.`
                  : '포스트가 없습니다.'}
            </p>
            {isAdmin && !searchFromUrl && !categoryFromUrl && (
              <Link href="/blog/new" className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
                첫 포스트 작성하기
              </Link>
            )}
            {(searchFromUrl || categoryFromUrl) && (
              <button
                onClick={() => { setSearchInput(''); updateUrl(1, '', '', sortFromUrl) }}
                className="mt-4 inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400"
              >
                전체 목록으로
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-3 sm:gap-4">
              {posts.map((post) => (
                <Link key={post.id} href={`/blog/${post.id}?from=list`} className="block">
                  <PostCard post={post} />
                </Link>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-10 flex items-center justify-center gap-2">
                <button
                  onClick={() => updateUrl(Math.max(1, pageFromUrl - 1), searchFromUrl, categoryFromUrl, sortFromUrl)}
                  disabled={pageFromUrl === 1}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 transition-colors hover:bg-gray-50 disabled:opacity-40 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <span className="min-w-[60px] text-center text-sm text-gray-500 dark:text-gray-400">
                  {pageFromUrl} / {totalPages}
                </span>
                <button
                  onClick={() => updateUrl(Math.min(totalPages, pageFromUrl + 1), searchFromUrl, categoryFromUrl, sortFromUrl)}
                  disabled={pageFromUrl === totalPages}
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
