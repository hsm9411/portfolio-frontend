import { notFound } from 'next/navigation'
import { fetchProjectById } from '@/lib/api/server'
import ProjectDetailClient from './ProjectDetailClient'

interface Props {
  params: Promise<{ id: string }>
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
