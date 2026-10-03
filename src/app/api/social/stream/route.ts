import type { NextRequest } from 'next/server';
import { createLivePost } from '@/lib/mock/social';
import { parseCategories } from '@/lib/server/params';

export const dynamic = 'force-dynamic';

const POST_INTERVAL_MS = 15_000;
const HEARTBEAT_MS = 20_000;
/** Close well before serverless time limits; EventSource reconnects on its own. */
const MAX_STREAM_MS = 4 * 60_000;

/**
 * Server-Sent Events stream of new social posts.
 * GET /api/social/stream?categories=technology,sports
 */
export async function GET(request: NextRequest) {
  const categories = parseCategories(request.nextUrl.searchParams.get('categories'));
  const encoder = new TextEncoder();
  const timers: Array<ReturnType<typeof setInterval>> = [];
  let closed = false;

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const close = () => {
        if (closed) return;
        closed = true;
        timers.forEach(clearInterval);
        try {
          controller.close();
        } catch {
          // Already closed by the client.
        }
      };
      const send = (chunk: string) => {
        if (closed) return;
        try {
          controller.enqueue(encoder.encode(chunk));
        } catch {
          close();
        }
      };

      send('retry: 10000\n\n');
      timers.push(
        setInterval(() => send(`event: post\ndata: ${JSON.stringify(createLivePost(categories))}\n\n`), POST_INTERVAL_MS),
        setInterval(() => send(': keep-alive\n\n'), HEARTBEAT_MS),
        setTimeout(close, MAX_STREAM_MS),
      );
      request.signal.addEventListener('abort', close);
    },
    cancel() {
      closed = true;
      timers.forEach(clearInterval);
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
