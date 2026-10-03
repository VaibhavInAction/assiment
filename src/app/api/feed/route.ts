import type { NextRequest } from 'next/server';
import { getFeedPage } from '@/lib/server/content';
import { parseCategories, parsePage, parseSources } from '@/lib/server/params';

/** GET /api/feed?categories=technology,sports&sources=news,social&page=1 */
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  try {
    const page = await getFeedPage({
      categories: parseCategories(params.get('categories')),
      sources: parseSources(params.get('sources')),
      page: parsePage(params.get('page')),
    });
    return Response.json(page, { headers: { 'Cache-Control': 'private, max-age=60' } });
  } catch (error) {
    console.error('[api/feed]', error);
    return Response.json({ error: 'Failed to load feed' }, { status: 500 });
  }
}
