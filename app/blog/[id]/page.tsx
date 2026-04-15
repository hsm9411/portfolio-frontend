import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { fetchPostById } from '@/lib/api/server'
import BlogPostClient from './BlogPostClient'

interface Props {
  params: Promise<{ id: string }>
  searchParams: Promise<{ from?: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  try {
    const post = await fetchPostById(id)
    return {
      title: post.title,
      description: post.summary,
      openGraph: {
        title: post.title,
        description: post.summary,
        url: `/blog/${id}`,
        type: 'article',
        publishedTime: post.publishedAt ?? post.createdAt,
        tags: post.tags,
      },
      twitter: {
        card: 'summary_large_image',
        title: post.title,
        description: post.summary,
      },
    }
  } catch {
    return { title: '포스트를 찾을 수 없습니다' }
  }
}

export default async function BlogPostPage({ params, searchParams }: Props) {
  const { id } = await params
  const { from } = await searchParams

  let post
  try {
    post = await fetchPostById(id)
  } catch {
    notFound()
  }

  return <BlogPostClient post={post} from={from} />
}
