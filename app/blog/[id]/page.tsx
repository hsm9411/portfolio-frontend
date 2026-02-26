import { notFound } from 'next/navigation'
import { fetchPostById } from '@/lib/api/server'
import BlogPostClient from './BlogPostClient'

interface Props {
  params: Promise<{ id: string }>
}

export default async function BlogPostPage({ params }: Props) {
  const { id } = await params

  let post
  try {
    post = await fetchPostById(id)
  } catch {
    notFound()
  }

  return <BlogPostClient post={post} />
}
