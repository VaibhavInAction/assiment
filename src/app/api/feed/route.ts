import type { NextRequest } from 'next/server';
import { getFeedPage } from '@/lib/server/content';
import { parseCategories, parsePage, parseSources, parseTmdbId } from '@/lib/server/params';

/** GET /api/feed?categories=technology,sports&sources=news,movie,social&page=1&basedOn=27205 */
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  try {
    const page = await getFeedPage({
      categories: parseCategories(params.get('categories')),
      sources: parseSources(params.get('sources')),
      page: parsePage(params.get('page')),
      basedOn: parseTmdbId(params.get('basedOn')),
    });
    return Response.json(page, { headers: { 'Cache-Control': 'private, max-age=60' } });
  } catch (error) {
    console.error('[api/feed]', error);
    return Response.json({ error: 'Failed to load feed' }, { status: 500 });
  }
}
