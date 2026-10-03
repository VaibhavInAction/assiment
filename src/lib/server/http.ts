import 'server-only';

export class UpstreamError extends Error {
  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message);
    this.name = 'UpstreamError';
  }
}

/** Upstream responses are cached for 15 minutes to protect free-tier quotas. */
export const UPSTREAM_REVALIDATE_SECONDS = 900;

export async function fetchJson<T>(url: string, init: RequestInit = {}, timeoutMs = 8000): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: { Accept: 'application/json', ...init.headers },
    signal: AbortSignal.timeout(timeoutMs),
    next: { revalidate: UPSTREAM_REVALIDATE_SECONDS },
  });
  if (!response.ok) {
    throw new UpstreamError(`Upstream request failed with ${response.status}`, response.status);
  }
  return (await response.json()) as T;
}

export function isMockMode(): boolean {
  return process.env.USE_MOCK_DATA === 'true';
}

/** Logs a short reason without ever printing the request URL (it may hold a key). */
export function logFallback(source: string, error: unknown): void {
  const reason = error instanceof Error ? error.message : 'unknown error';
  console.warn(`[${source}] using demo data: ${reason}`);
}
