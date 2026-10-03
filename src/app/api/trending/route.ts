import type { NextRequest } from 'next/server';
import { getTrending } from '@/lib/server/content';
import { parseCategoryOrAll } from '@/lib/server/params';

/** GET /api/trending?category=all|technology|... */
export async function GET(request: NextRequest) {
  try {
    const trending = await getTrending(parseCategoryOrAll(request.nextUrl.searchParams.get('category')));
    return Response.json(trending, { headers: { 'Cache-Control': 'private, max-age=120' } });
  } catch (error) {
    console.error('[api/trending]', error);
    return Response.json({ error: 'Failed to load trending content' }, { status: 500 });
  }
}
