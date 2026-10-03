/** Returns a copy of `ids` with `fromId` moved into the position of `toId`. */
export function moveId(ids: string[], fromId: string, toId: string): string[] {
  const from = ids.indexOf(fromId);
  const to = ids.indexOf(toId);
  if (from === -1 || to === -1 || from === to) return ids;

  const next = ids.slice();
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next;
}

/** Moves `id` one or more steps earlier (negative) or later (positive). */
export function moveIdBy(ids: string[], id: string, delta: number): string[] {
  const index = ids.indexOf(id);
  const target = ids[index + delta];
  if (index === -1 || target === undefined) return ids;
  return moveId(ids, id, target);
}

/**
 * Applies the user's saved drag-and-drop order to a freshly fetched list.
 *
 * Items the user has ordered keep their relative order, and they fill the
 * slots those items occupy in the natural list. Items the user has never seen
 * (a new page, a live post) stay where they naturally appear instead of being
 * pushed to the end.
 */
export function applyCustomOrder<T extends { id: string }>(items: T[], order: string[]): T[] {
  if (order.length === 0) return items;

  const rank = new Map(order.map((id, index) => [id, index] as const));
  const ordered = items
    .filter((item) => rank.has(item.id))
    .sort((a, b) => (rank.get(a.id) ?? 0) - (rank.get(b.id) ?? 0));

  let next = 0;
  return items.map((item) => (rank.has(item.id) ? ordered[next++] : item));
}
