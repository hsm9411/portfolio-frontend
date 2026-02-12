'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getProject, type Project } from '@/lib/api/projects'
import LikeButton from '@/components/LikeButton'
import CommentSection from '@/components/CommentSection'
import { formatDistanceToNow } from 'date-fns'
import { ko } from 'date-fns/locale'

export default function ProjectDetailPage() {
  const params = useParams()
  const router = useRouter()
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
    } catch (error: any) {
      console.error('Failed to load project:', error)
      if (error.response?.status === 404) {
        alert('프로젝트를 찾을 수 없습니다.')
        router.push('/projects')
      }
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
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
      <header className="border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
          <button
            onClick={() => router.back()}
            className="mb-4 flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
          >
            ← 뒤로가기
          </button>
          
          <div className="mb-4 flex items-center gap-2">
            <span
              className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${
                project.status === 'completed'
                  ? 'bg-green-100 text-green-800'
                  : project.status === 'in-progress'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {project.status === 'completed'
                ? '완료'
                : project.status === 'in-progress'
                ? '진행중'
                : '보관'}
            </span>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {project.title}
          </h1>
          
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            {project.summary}
          </p>

          <div className="mt-4 flex items-center gap-6 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              👁️ {project.viewCount}
            </span>
            <span>
              {formatDistanceToNow(new Date(project.createdAt), {
                addSuffix: true,
                locale: ko,
              })}
            </span>
            <span>by {project.authorNickname}</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Thumbnail */}
        {project.thumbnailUrl && (
          <div className="mb-8 overflow-hidden rounded-lg">
            <img
              src={project.thumbnailUrl}
              alt={project.title}
              className="w-full object-cover"
            />
          </div>
        )}

        {/* Tech Stack */}
        <div className="mb-8">
          <h2 className="mb-3 text-lg font-bold text-gray-900 dark:text-white">
            기술 스택
          </h2>
          <div className="flex flex-wrap gap-2">
            {project.techStack.map((tech) => (
              <span
                key={tech}
                className="rounded-lg bg-blue-100 px-3 py-1.5 text-sm font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>

        {/* Tags */}
        {project.tags.length > 0 && (
          <div className="mb-8">
            <h2 className="mb-3 text-lg font-bold text-gray-900 dark:text-white">
              태그
            </h2>
            <div className="flex flex-wrap gap-2">
              {project.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-lg bg-gray-100 px-3 py-1.5 text-sm text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Description */}
        <div className="mb-8">
          <h2 className="mb-3 text-lg font-bold text-gray-900 dark:text-white">
            프로젝트 설명
          </h2>
          <div className="prose max-w-none dark:prose-invert">
            <p className="whitespace-pre-wrap text-gray-700 dark:text-gray-300">
              {project.description}
            </p>
          </div>
        </div>

        {/* Links */}
        <div className="mb-8 flex gap-4">
          {project.demoUrl && (
            <a
              href={project.demoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-medium text-white hover:bg-blue-700"
            >
              🌐 데모 보기
            </a>
          )}
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-lg bg-gray-900 px-6 py-3 text-sm font-medium text-white hover:bg-gray-800"
            >
              💻 GitHub
            </a>
          )}
        </div>

        {/* Like Button */}
        <div className="mb-8 border-t border-gray-200 pt-8 dark:border-gray-700">
          <LikeButton
            targetType="project"
            targetId={project.id}
            initialLikeCount={project.likeCount}
          />
        </div>

        {/* Comments */}
        <div className="border-t border-gray-200 pt-8 dark:border-gray-700">
          <CommentSection targetType="project" targetId={project.id} />
        </div>
      </main>
    </div>
  )
}
