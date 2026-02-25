import { revalidatePath, revalidateTag } from 'next/cache';
import type { NextRequest } from 'next/server';

interface RevalidateBody {
  type: 'project' | 'post';
  id?: string;
  slug?: string;
}

export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-revalidate-secret');

  if (!secret || secret !== process.env.REVALIDATE_SECRET) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: RevalidateBody;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { type, id, slug } = body;

  if (type === 'project') {
    revalidateTag('projects');
    revalidatePath('/projects');
    if (id) {
      revalidateTag(`project-${id}`);
      revalidatePath(`/projects/${id}`);
    }
  }

  if (type === 'post') {
    revalidateTag('posts');
    revalidatePath('/blog');
    if (id) {
      revalidateTag(`post-${id}`);
      revalidatePath(`/blog/${id}`);
    }
  }

  return Response.json({
    revalidated: true,
    type,
    target: id ?? slug ?? 'list',
    timestamp: new Date().toISOString(),
  });
}
