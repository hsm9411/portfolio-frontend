import type { Metadata } from 'next'
import { fetchProjects, fetchPosts } from '@/lib/api/server'
import { type Project } from '@/lib/api/projects'
import { type Post } from '@/lib/api/posts'

export const metadata: Metadata = {
  title: { absolute: 'hsm | Portfolio' },
  description: '개발자 포트폴리오 & 기술 블로그. 프로젝트 경험과 기술적 인사이트를 공유합니다.',
  openGraph: {
    title: 'hsm | Portfolio',
    description: '개발자 포트폴리오 & 기술 블로그. 프로젝트 경험과 기술적 인사이트를 공유합니다.',
    url: '/',
  },
}
import ProjectCard from '@/components/ProjectCard'
import PostCard from '@/components/PostCard'
import Link from 'next/link'
import Skills from '@/components/Skills'
import Experience from '@/components/Experience'
import Education from '@/components/Education'
import Contact from '@/components/Contact'

export default async function Home() {
  const [projectsData, postsData] = await Promise.all([
    fetchProjects({ page: 1, limit: 6, sortBy: 'created_at', order: 'DESC' })
      .then((r) => r.items as Project[])
      .catch(() => [] as Project[]),
    fetchPosts({ page: 1, limit: 3 })
      .then((r) => r.items as Post[])
      .catch(() => [] as Post[]),
  ])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">

      {/* ── 히어로 ── */}
      <section className="flex min-h-[75vh] items-center justify-center border-b border-gray-200 bg-white sm:min-h-[calc(100vh-72px)] dark:border-gray-800 dark:bg-gray-900">
        <div className="mx-auto flex w-full max-w-[900px] flex-col items-center gap-8 px-5 pb-8 pt-8 md:flex-row md:items-center md:justify-between md:gap-16 md:pb-[5vh]">
          <div className="text-center md:text-left">
            <h1 className="mb-4 text-3xl font-black leading-tight tracking-tight text-gray-900 dark:text-white sm:text-4xl md:text-5xl">
              안녕하세요,<br />
              개발자 하성민입니다.
            </h1>
            <p className="text-sm leading-relaxed text-gray-500 dark:text-gray-400 sm:text-base">
              최근에는 <strong className="font-semibold text-gray-800 dark:text-gray-200">웹개발</strong>과{' '}
              <strong className="font-semibold text-gray-800 dark:text-gray-200">시스템 개발</strong>에 필요한 기능을 구현하기 위해<br className="hidden sm:block" />
              다양한 <strong className="font-semibold text-gray-800 dark:text-gray-200">CS 개념</strong>과 기술들에 관심을 가지고 학습하고 있습니다.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-gray-500 dark:text-gray-400 sm:mt-4 sm:text-base">
              또한, 효율적인 <strong className="font-semibold text-gray-800 dark:text-gray-200">협업</strong>을 위해 필요한 툴과 기술,<br className="hidden sm:block" />
              그리고 <strong className="font-semibold text-gray-800 dark:text-gray-200">개발 프로세스 체계</strong>를 경험하며 성장하고 있습니다.
            </p>
            {/* CTA 버튼 */}
            <div className="mt-6 flex flex-wrap justify-center gap-3 sm:mt-7 md:justify-start">
              <Link
                href="/projects"
                className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
              >
                프로젝트 보기
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
              <Link
                href="/blog"
                className="flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-transparent dark:text-gray-200 dark:hover:bg-gray-800"
              >
                블로그 보기
              </Link>
            </div>
          </div>
          <div className="shrink-0">
            <img
              src="/profile.png"
              alt="Profile"
              className="w-[180px] h-auto border border-gray-200 object-cover shadow-[12px_12px_0px_rgba(0,0,0,0.1)] dark:border-gray-700 dark:shadow-[12px_12px_0px_rgba(255,255,255,0.05)] sm:w-[210px] md:w-[240px] md:shadow-[15px_15px_0px_rgba(0,0,0,0.1)]"
            />
          </div>
        </div>
      </section>

      <Skills />

      {/* ── 콘텐츠 ── */}
      <main className="mx-auto max-w-[1000px] px-4 py-8 sm:px-5 sm:py-12">
        <div className="space-y-12 sm:space-y-16">

          {/* Projects */}
          <section>
            <div className="mb-5 flex items-center justify-between sm:mb-6">
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white sm:text-xl">Recent Projects</h2>
                <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400 sm:text-sm">최근 작업한 프로젝트</p>
              </div>
              <Link
                href="/projects"
                className="flex items-center gap-1 text-xs font-medium text-blue-600 transition-colors hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 sm:text-sm"
              >
                전체보기
                <svg className="h-3.5 w-3.5 sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            {projectsData.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-200 py-10 text-center dark:border-gray-700 sm:py-14">
                <p className="text-sm text-gray-400">아직 프로젝트가 없습니다.</p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
                {projectsData.map((project) => (
                  <Link key={project.id} href={`/projects/${project.id}`} className="block">
                    <ProjectCard project={project} />
                  </Link>
                ))}
              </div>
            )}
          </section>

          {/* Blog */}
          <section>
            <div className="mb-5 flex items-center justify-between sm:mb-6">
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white sm:text-xl">Recent Posts</h2>
                <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400 sm:text-sm">최근 작성한 블로그 포스트</p>
              </div>
              <Link
                href="/blog"
                className="flex items-center gap-1 text-xs font-medium text-blue-600 transition-colors hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 sm:text-sm"
              >
                전체보기
                <svg className="h-3.5 w-3.5 sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            {postsData.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-200 py-10 text-center dark:border-gray-700 sm:py-14">
                <p className="text-sm text-gray-400">아직 포스트가 없습니다.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3 sm:gap-4">
                {postsData.map((post) => (
                  <Link key={post.id} href={`/blog/${post.id}`} className="block">
                    <PostCard post={post} />
                  </Link>
                ))}
              </div>
            )}
          </section>

        </div>
      </main>

      <Experience />
      <Education />
      <Contact />

      {/* Footer */}
      <footer className="mt-12 border-t border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 sm:mt-16">
        <div className="mx-auto max-w-[1000px] px-4 py-6 sm:px-5 sm:py-8">
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
