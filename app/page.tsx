'use client'

import { useEffect, useState } from 'react'
import { getProjects, type Project } from '@/lib/api/projects'
import { getPosts, type Post } from '@/lib/api/posts'
import ProjectCard from '@/components/ProjectCard'
import PostCard from '@/components/PostCard'
import Link from 'next/link'

export default function Home() {
  const [projects, setProjects] = useState<Project[]>([])
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [projectsData, postsData] = await Promise.all([
        getProjects({ limit: 6, sortBy: 'created_at', order: 'DESC' }).then((r) => r.items).catch(() => []),
        getPosts({ limit: 3 }).then((r) => r.items).catch(() => []),
      ])
      setProjects(projectsData)
      setPosts(postsData)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">

      {/* ── 히어로 ── */}
      <section className="border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-800/50">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
          <div className="max-w-2xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 ring-1 ring-blue-600/20 dark:bg-blue-900/30 dark:text-blue-300 dark:ring-blue-500/30">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-600 dark:bg-blue-400" />
              Available for work
            </div>
            <h1 className="mb-4 text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl">
              안녕하세요,<br />
              <span className="text-blue-600 dark:text-blue-400">백엔드 개발자</span> HSM입니다.
            </h1>
            <p className="mb-8 text-lg leading-relaxed text-gray-600 dark:text-gray-400">
              NestJS, Next.js, Docker를 활용한 풀스택 개발을 합니다.<br />
              임베디드 시스템과 AI 최적화에도 관심이 있습니다.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/projects"
                className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700"
              >
                프로젝트 보기
              </Link>
              <Link
                href="/blog"
                className="rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                블로그 보기
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── 콘텐츠 ── */}
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
          </div>
        ) : (
          <div className="space-y-16">

            {/* Projects */}
            <section>
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Recent Projects</h2>
                  <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">최근 작업한 프로젝트</p>
                </div>
                <Link
                  href="/projects"
                  className="flex items-center gap-1 text-sm font-medium text-blue-600 transition-colors hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  전체보기
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>

              {projects.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-gray-200 py-14 text-center dark:border-gray-700">
                  <p className="text-sm text-gray-400">아직 프로젝트가 없습니다.</p>
                </div>
              ) : (
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {projects.map((project) => (
                    <Link key={project.id} href={`/projects/${project.id}`} className="block">
                      <ProjectCard project={project} />
                    </Link>
                  ))}
                </div>
              )}
            </section>

            {/* Blog */}
            <section>
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Recent Posts</h2>
                  <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">최근 작성한 블로그 포스트</p>
                </div>
                <Link
                  href="/blog"
                  className="flex items-center gap-1 text-sm font-medium text-blue-600 transition-colors hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  전체보기
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>

              {posts.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-gray-200 py-14 text-center dark:border-gray-700">
                  <p className="text-sm text-gray-400">아직 포스트가 없습니다.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {posts.map((post) => (
                    <Link key={post.id} href={`/blog/${post.id}`} className="block">
                      <PostCard post={post} />
                    </Link>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center gap-2 sm:flex-row sm:justify-between">
            <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">hsm9411</p>
            <p className="text-xs text-gray-400 dark:text-gray-600">
              Built with NestJS · Next.js · Supabase · Oracle Cloud
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
