import { fetchProjects } from '@/lib/api/server'
import ProjectsClient from './ProjectsClient'

/**
 * 서버 컴포넌트 (ISR)
 *
 * - 첫 로드: fetchProjects() → ISR 캐시에서 서빙 (revalidateTag('projects') 전까지 유지)
 * - 필터/페이지 변경: ProjectsClient 내부에서 기존 Axios fetch 사용
 * - 웹훅으로 revalidateTag('projects') 호출 시 캐시 무효화 → 다음 요청에서 fresh data
 */
export default async function ProjectsPage() {
  let initialData = { items: [], total: 0, page: 1, pageSize: 9, totalPages: 1 }

  try {
    initialData = await fetchProjects({ page: 1, limit: 9, sortBy: 'created_at', order: 'DESC' })
  } catch (e) {
    console.error('ProjectsPage SSR fetch failed, falling back to client fetch', e)
  }

  return <ProjectsClient initialData={initialData} />
}
