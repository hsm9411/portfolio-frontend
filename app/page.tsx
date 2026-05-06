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
import Image from 'next/image'
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
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">

      {/* ── 히어로 ── */}
      {/* 모바일: 원형 사진(96px) 위 + 압축 본문 / 데스크탑(md+): 전체 높이 + 사각 사진 우측 */}
      <section className="flex items-center justify-center border-b border-gray-200 bg-white py-14 sm:py-20 md:min-h-[calc(100vh-72px)] md:py-0 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto flex w-full max-w-[900px] flex-col items-center gap-6 px-5 md:flex-row md:items-center md:justify-between md:gap-16 md:pb-[5vh]">
          {/* 모바일 전용 사진: 112px 원형, Next/Image 최적화 + object-top으로 얼굴 보존 */}
          <div className="md:hidden">
            <Image
              src="/profile.png"
              alt="Profile"
              width={112}
              height={112}
              priority
              className="h-28 w-28 rounded-full border border-zinc-200 object-cover object-top dark:border-zinc-700"
            />
          </div>

          <div className="text-center md:text-left">
            <h1 className="mb-3 text-3xl font-black leading-tight tracking-tight text-gray-900 dark:text-white sm:text-4xl md:mb-4 md:text-5xl">
              안녕하세요,<br />
              개발자 하성민입니다.
            </h1>
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-indigo-600 dark:text-indigo-400 sm:text-sm md:mb-5">
              Web · Systems Developer
            </p>
            {/* 본문 한 줄 — 모바일에선 숨기고 데스크탑(md+)에서만 표시 */}
            <p className="mt-4 hidden text-sm leading-relaxed text-gray-500 dark:text-gray-400 sm:text-base md:block">
              <strong className="font-semibold text-gray-800 dark:text-gray-200">웹·시스템 개발</strong>에 필요한{' '}
              <strong className="font-semibold text-gray-800 dark:text-gray-200">CS</strong>와{' '}
              <strong className="font-semibold text-gray-800 dark:text-gray-200">협업 프로세스</strong>를{' '}
              학습하며 성장하고 있습니다.
            </p>
            {/* CTA — 모바일 전용 (데스크탑은 네비바로 충분) */}
            <div className="mt-6 flex items-center justify-center gap-4 md:hidden">
              <Link
                href="/projects"
                className="flex items-center gap-1.5 rounded-lg border border-gray-800 px-4 py-2 text-sm font-semibold text-gray-900 transition-colors hover:bg-zinc-50 dark:border-gray-300 dark:text-gray-100 dark:hover:bg-zinc-800"
              >
                프로젝트 보기
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
              <Link
                href="/blog"
                className="flex items-center gap-1 text-sm font-medium text-gray-400 transition-colors hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
              >
                블로그
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>

          {/* 데스크탑 전용 사진: 240px 사각 + 그림자 */}
          <div className="hidden shrink-0 md:block">
            <img
              src="/profile.png"
              alt="Profile"
              className="h-auto w-[240px] border border-gray-200 object-cover shadow-[15px_15px_0px_rgba(0,0,0,0.08)] dark:border-zinc-700 dark:shadow-[15px_15px_0px_rgba(255,255,255,0.04)]"
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
                className="flex items-center gap-1 text-xs font-medium text-indigo-600 transition-colors hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 sm:text-sm"
              >
                전체보기
                <svg className="h-3.5 w-3.5 sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            {projectsData.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-200 py-10 text-center dark:border-zinc-700 sm:py-14">
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
                className="flex items-center gap-1 text-xs font-medium text-indigo-600 transition-colors hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 sm:text-sm"
              >
                전체보기
                <svg className="h-3.5 w-3.5 sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            {postsData.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-200 py-10 text-center dark:border-zinc-700 sm:py-14">
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
      <footer className="mt-12 border-t border-gray-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 sm:mt-16">
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
