import type { MetadataRoute } from 'next'
import { fetchPosts, fetchProjects } from '@/lib/api/server'
import type { Post } from '@/lib/api/posts'
import type { Project } from '@/lib/api/projects'

export const revalidate = 3600

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://hsm9411.vercel.app'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${BASE_URL}/projects`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
  ]

  const [postRoutes, projectRoutes] = await Promise.all([
    fetchPosts({ page: 1, limit: 1000 })
      .then((data: { items: Post[] }) =>
        data.items
          .filter((post) => post.isPublished)
          .map((post): MetadataRoute.Sitemap[number] => ({
            url: `${BASE_URL}/blog/${post.id}`,
            lastModified: new Date(post.updatedAt),
            changeFrequency: 'weekly',
            priority: 0.7,
          }))
      )
      .catch(() => [] as MetadataRoute.Sitemap),

    fetchProjects({ page: 1, limit: 1000 })
      .then((data: { items: Project[] }) =>
        data.items.map((project): MetadataRoute.Sitemap[number] => ({
          url: `${BASE_URL}/projects/${project.id}`,
          lastModified: new Date(project.updatedAt),
          changeFrequency: 'monthly',
          priority: 0.8,
        }))
      )
      .catch(() => [] as MetadataRoute.Sitemap),
  ])

  return [...staticRoutes, ...postRoutes, ...projectRoutes]
}
