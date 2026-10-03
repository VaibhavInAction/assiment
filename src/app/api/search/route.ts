import type { NextRequest } from 'next/server';
import { searchContent } from '@/lib/server/content';
import { parseFilter, parsePage, parseQuery } from '@/lib/server/params';

/** GET /api/search?q=space&type=all|news|movie|social&page=1 */
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const query = parseQuery(params.get('q'));
  const page = parsePage(params.get('page'));

  if (query.length < 2) {
    return Response.json({ error: 'Query must be at least 2 characters' }, { status: 400 });
  }

  try {
    const result = await searchContent({ query, type: parseFilter(params.get('type')), page });
    return Response.json(result, { headers: { 'Cache-Control': 'private, max-age=60' } });
  } catch (error) {
    console.error('[api/search]', error);
    return Response.json({ error: 'Search failed' }, { status: 500 });
  }
}
