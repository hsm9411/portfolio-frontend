/**
 * 서버 컴포넌트 전용 fetch 함수
 *
 * - Next.js native fetch + next: { tags } 로 ISR 캐싱
 * - 클라이언트에서 사용하는 lib/api/projects.ts (Axios) 와 별개
 * - 이 파일은 'use client' 컴포넌트에서 import 금지
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'https://158.180.75.205';

// ─── Projects ────────────────────────────────────────────

export async function fetchProjects(params?: {
  page?: number;
  limit?: number;
  status?: string;
  sortBy?: string;
  order?: string;
}) {
  const qs = new URLSearchParams();
  if (params?.page)   qs.set('page',   String(params.page));
  if (params?.limit)  qs.set('limit',  String(params.limit));
  if (params?.status && params.status !== 'all') qs.set('status', params.status);
  if (params?.sortBy) qs.set('sortBy', params.sortBy);
  if (params?.order)  qs.set('order',  params.order);

  const url = `${API_URL}/projects${qs.toString() ? `?${qs}` : ''}`;

  const res = await fetch(url, {
    next: { tags: ['projects'], revalidate: 3600 },
  });

  if (!res.ok) throw new Error(`fetchProjects failed: ${res.status}`);
  return res.json();
}

export async function fetchProjectById(id: string) {
  const res = await fetch(`${API_URL}/projects/${id}`, {
    next: { tags: ['projects', `project-${id}`], revalidate: 3600 },
  });

  if (!res.ok) throw new Error(`fetchProjectById failed: ${res.status}`);
  return res.json();
}

// ─── Posts ───────────────────────────────────────────────

export async function fetchPosts(params?: {
  page?: number;
  limit?: number;
  search?: string;
}) {
  const qs = new URLSearchParams();
  if (params?.page)   qs.set('page',   String(params.page));
  if (params?.limit)  qs.set('limit',  String(params.limit));
  if (params?.search) qs.set('search', params.search);

  const url = `${API_URL}/posts${qs.toString() ? `?${qs}` : ''}`;

  const res = await fetch(url, {
    next: { tags: ['posts'], revalidate: 3600 },
  });

  if (!res.ok) throw new Error(`fetchPosts failed: ${res.status}`);
  return res.json();
}

export async function fetchPostById(id: string) {
  const res = await fetch(`${API_URL}/posts/${id}`, {
    next: { tags: ['posts', `post-${id}`], revalidate: 3600 },
  });

  if (!res.ok) throw new Error(`fetchPostById failed: ${res.status}`);
  return res.json();
}
