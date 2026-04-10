import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { fetchProjectById } from '@/lib/api/server'
import ProjectDetailClient from './ProjectDetailClient'

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  try {
    const project = await fetchProjectById(id)
    return {
      title: project.title,
      description: project.summary,
      openGraph: {
        title: project.title,
        description: project.summary,
        url: `/projects/${id}`,
      },
      twitter: {
        card: 'summary_large_image',
        title: project.title,
        description: project.summary,
      },
    }
  } catch {
    return { title: '프로젝트를 찾을 수 없습니다' }
  }
}

export default async function ProjectDetailPage({ params }: Props) {
  const { id } = await params

  let project
  try {
    project = await fetchProjectById(id)
  } catch {
    notFound()
  }

  return <ProjectDetailClient project={project} />
}
