'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getProject, type Project } from '@/lib/api/projects'
import { useAuth } from '@/hooks/useAuth'
import LikeButton from '@/components/LikeButton'
import CommentSection from '@/components/CommentSection'
import { formatDistanceToNow } from 'date-fns'
import { ko } from 'date-fns/locale'
import api from '@/lib/api/client'

export default function ProjectDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { isAdmin } = useAuth()
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.id) {
      loadProject(params.id as string)
    }
  }, [params.id])

  const loadProject = async (id: string) => {
    try {
      setLoading(true)
      const data = await getProject(id)
      setProject(data)
    } catch (error: unknown) {
      console.error('Failed to load project:', error)
      const err = error as { response?: { status?: number } }
      if (err.response?.status === 404) {
        alert('프로젝트를 찾을 수 없습니다.')
        router.push('/projects')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!project) return
    
    if (!confirm('정말 삭제하시겠습니까?')) return

    try {
      await api.delete(`/projects/${project.id}`)
      alert('프로젝트가 삭제되었습니다.')
      router.push('/projects')
    } catch (error: unknown) {
      console.error('Failed to delete project:', error)
      const err = error as { response?: { data?: { message?: string } } }
      alert(err.response?.data?.message || '삭제에 실패했습니다.')
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
      </div>
    )
  }

  if (!project) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-800">
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Navigation & Actions */}
          <div className="mb-6 flex items-center justify-between">
            <button
              onClick={() => router.push('/projects')}
              className="flex items-center gap-2 text-sm font-medium text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              목록으로
            </button>
            
            {isAdmin && (
              <div className="flex gap-3">
                <button
                  onClick={() => router.push(`/projects/${project.id}/edit`)}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700"
                >
                  수정
                </button>
                <button
                  onClick={handleDelete}
                  className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-red-700"
                >
                  삭제
                </button>
              </div>
            )}
          </div>
          
          {/* Status Badge */}
          <div className="mb-4">
            <span
              className={`inline-flex rounded-full px-4 py-1.5 text-xs font-semibold ${
                project.status === 'completed'
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                  : project.status === 'in-progress'
                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                  : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
              }`}
            >
              {project.status === 'completed' ? '✓ 완료' : project.status === 'in-progress' ? '⟳ 진행중' : '📦 보관'}
            </span>
          </div>

          {/* Title */}
          <h1 className="mb-4 text-4xl font-bold leading-tight text-gray-900 dark:text-white">
            {project.title}
          </h1>
          
          {/* Summary */}
          <p className="mb-6 text-lg text-gray-600 dark:text-gray-400">
            {project.summary}
          </p>

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1.5">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              {project.viewCount}
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {formatDistanceToNow(new Date(project.createdAt), { addSuffix: true, locale: ko })}
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              {project.authorNickname}
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="space-y-10">
          {/* Thumbnail */}
          {project.thumbnailUrl && (
            <div className="overflow-hidden rounded-xl shadow-md">
              <img
                src={project.thumbnailUrl}
                alt={project.title}
                className="w-full object-cover"
              />
            </div>
          )}

          {/* Tech Stack */}
          {project.techStack && project.techStack.length > 0 && (
            <section className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
              <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">
                🛠️ 기술 스택
              </h2>
              <div className="flex flex-wrap gap-2.5">
                {project.techStack.map((tech) => (
                  <span
                    key={tech}
                    className="rounded-lg bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 ring-1 ring-blue-600/20 dark:bg-blue-900/30 dark:text-blue-300 dark:ring-blue-500/30"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Tags */}
          {project.tags && project.tags.length > 0 && (
            <section className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
              <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">
                🏷️ 태그
              </h2>
              <div className="flex flex-wrap gap-2.5">
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Description */}
          <section className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
            <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">
              📝 프로젝트 설명
            </h2>
            <div className="prose prose-gray max-w-none dark:prose-invert">
              <p className="whitespace-pre-wrap leading-relaxed text-gray-700 dark:text-gray-300">
                {project.description}
              </p>
            </div>
          </section>

          {/* Links */}
          {(project.demoUrl || project.githubUrl) && (
            <section className="flex flex-wrap gap-3">
              {project.demoUrl && (
                <a
                  href={project.demoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white shadow-md transition-colors hover:bg-blue-700"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                  데모 보기
                </a>
              )}
              {project.githubUrl && (
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-lg bg-gray-900 px-6 py-3 font-semibold text-white shadow-md transition-colors hover:bg-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600"
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                  </svg>
                  GitHub
                </a>
              )}
            </section>
          )}

          {/* Like Button */}
          <section className="border-t border-gray-200 pt-8 dark:border-gray-700">
            <LikeButton
              targetType="project"
              targetId={project.id}
              initialLikeCount={project.likeCount}
            />
          </section>

          {/* Comments */}
          <section className="border-t border-gray-200 pt-8 dark:border-gray-700">
            <CommentSection targetType="project" targetId={project.id} />
          </section>
        </div>
      </main>
    </div>
  )
}
