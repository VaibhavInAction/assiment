import { hashString } from '@/lib/utils';

/** Small deterministic PRNG so demo data is stable between requests and tests. */
function mulberry32(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function seededRandom(key: string): () => number {
  return mulberry32(parseInt(hashString(key), 36));
}

export function pick<T>(list: readonly T[], random: () => number): T {
  return list[Math.floor(random() * list.length)];
}

export function demoImage(seed: string): string {
  return `https://picsum.photos/seed/${encodeURIComponent(seed)}/640/360`;
}

export function paginate<T>(items: T[], page: number, pageSize: number) {
  const start = (page - 1) * pageSize;
  return { items: items.slice(start, start + pageSize), hasMore: start + pageSize < items.length };
}

export function matchesQuery(query: string, ...fields: Array<string | undefined>): boolean {
  const needle = query.trim().toLowerCase();
  if (!needle) return true;
  return fields.some((field) => field?.toLowerCase().includes(needle));
}
