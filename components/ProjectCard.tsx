import type { Project } from '@/lib/api/projects'
import { formatDistanceToNow } from 'date-fns'
import { ko } from 'date-fns/locale'

interface ProjectCardProps {
  project: Project
}

export default function ProjectCard({ project }: ProjectCardProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800">
      {project.thumbnail_url && (
        <div className="aspect-video w-full overflow-hidden bg-gray-100">
          <img
            src={project.thumbnail_url}
            alt={project.title}
            className="h-full w-full object-cover"
          />
        </div>
      )}
      
      <div className="p-6">
        <div className="mb-2 flex items-center gap-2">
          <span
            className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
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

        <h3 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">
          {project.title}
        </h3>
        
        <p className="mb-4 line-clamp-2 text-sm text-gray-600 dark:text-gray-300">
          {project.summary}
        </p>

        <div className="mb-4 flex flex-wrap gap-2">
          {project.tech_stack.slice(0, 5).map((tech) => (
            <span
              key={tech}
              className="inline-flex rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700 dark:bg-gray-700 dark:text-gray-300"
            >
              {tech}
            </span>
          ))}
          {project.tech_stack.length > 5 && (
            <span className="inline-flex items-center text-xs text-gray-500">
              +{project.tech_stack.length - 5}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-gray-200 pt-4 dark:border-gray-700">
          <div className="flex gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              👁️ {project.view_count}
            </span>
            <span className="flex items-center gap-1">
              ❤️ {project.like_count}
            </span>
          </div>
          <span className="text-xs text-gray-400">
            {formatDistanceToNow(new Date(project.created_at), {
              addSuffix: true,
              locale: ko,
            })}
          </span>
        </div>
      </div>
    </div>
  )
}
