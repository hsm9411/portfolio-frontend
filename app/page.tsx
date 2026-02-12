'use client'

import { useEffect, useState } from 'react'
import { getProjects, type Project } from '@/lib/api/projects'
import { getPosts, type Post } from '@/lib/api/posts'
import ProjectCard from '@/components/ProjectCard'
import PostCard from '@/components/PostCard'
import AuthButton from '@/components/AuthButton'
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
      
      // Projects와 Posts를 개별적으로 로드 (하나 실패해도 다른 건 표시)
      const projectsPromise = getProjects({ limit: 6, sortBy: 'created_at', order: 'DESC' })
        .then(res => res.items)
        .catch(err => {
          console.error('Failed to load projects:', err)
          return []
        })
      
      const postsPromise = getPosts({ limit: 3 })
        .then(res => res.items)
        .catch(err => {
          console.error('Failed to load posts:', err)
          return []
        })

      const [projectsData, postsData] = await Promise.all([projectsPromise, postsPromise])
      
      setProjects(projectsData)
      setPosts(postsData)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Portfolio
              </h1>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                개발자 포트폴리오 & 블로그
              </p>
            </div>
            <AuthButton />
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
          </div>
        ) : (
          <>
            {/* Projects Section */}
            <section className="mb-16">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  📁 Recent Projects
                </h2>
                <Link
                  href="/projects"
                  className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400"
                >
                  전체보기 →
                </Link>
              </div>

              {projects.length === 0 ? (
                <div className="rounded-lg border border-gray-200 bg-white p-12 text-center dark:border-gray-700 dark:bg-gray-800">
                  <p className="text-gray-500">프로젝트가 없습니다.</p>
                  <p className="mt-2 text-sm text-gray-400">
                    백엔드 DB에 프로젝트를 추가해주세요.
                  </p>
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {projects.map((project) => (
                    <Link key={project.id} href={`/projects/${project.id}`}>
                      <ProjectCard project={project} />
                    </Link>
                  ))}
                </div>
              )}
            </section>

            {/* Blog Section */}
            <section>
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  📝 Recent Posts
                </h2>
                <Link
                  href="/blog"
                  className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400"
                >
                  전체보기 →
                </Link>
              </div>

              {posts.length === 0 ? (
                <div className="rounded-lg border border-gray-200 bg-white p-12 text-center dark:border-gray-700 dark:bg-gray-800">
                  <p className="text-gray-500">포스트가 없습니다.</p>
                  <p className="mt-2 text-sm text-gray-400">
                    백엔드 DB에 포스트를 추가해주세요.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {posts.map((post) => (
                    <Link key={post.id} href={`/blog/${post.slug}`}>
                      <PostCard post={post} />
                    </Link>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white py-8 dark:border-gray-700 dark:bg-gray-800">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <p className="text-sm text-gray-500">포트폴리오 & 블로그</p>
          <p className="mt-1 text-xs text-gray-400">
            NestJS + Next.js + Supabase
          </p>
        </div>
      </footer>
    </div>
  )
}
