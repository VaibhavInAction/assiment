import { describe, expect, it } from 'vitest';
import { applyCustomOrder, moveId, moveIdBy } from './feedOrder';

const items = (...ids: string[]) => ids.map((id) => ({ id }));
const ids = (list: Array<{ id: string }>) => list.map((item) => item.id);

describe('moveId', () => {
  it('moves an item forward into the target position', () => {
    expect(moveId(['a', 'b', 'c', 'd'], 'a', 'c')).toEqual(['b', 'c', 'a', 'd']);
  });

  it('moves an item backward into the target position', () => {
    expect(moveId(['a', 'b', 'c', 'd'], 'd', 'b')).toEqual(['a', 'd', 'b', 'c']);
  });

  it('returns the same array when an id is unknown or unchanged', () => {
    const list = ['a', 'b'];
    expect(moveId(list, 'a', 'a')).toBe(list);
    expect(moveId(list, 'x', 'a')).toBe(list);
    expect(moveId(list, 'a', 'x')).toBe(list);
  });
});

describe('moveIdBy', () => {
  it('moves one step in either direction', () => {
    expect(moveIdBy(['a', 'b', 'c'], 'b', -1)).toEqual(['b', 'a', 'c']);
    expect(moveIdBy(['a', 'b', 'c'], 'b', 1)).toEqual(['a', 'c', 'b']);
  });

  it('does nothing past either end', () => {
    expect(moveIdBy(['a', 'b'], 'a', -1)).toEqual(['a', 'b']);
    expect(moveIdBy(['a', 'b'], 'b', 1)).toEqual(['a', 'b']);
  });
});

describe('applyCustomOrder', () => {
  it('returns items untouched when there is no saved order', () => {
    const list = items('a', 'b');
    expect(applyCustomOrder(list, [])).toBe(list);
  });

  it('applies the saved order', () => {
    expect(ids(applyCustomOrder(items('a', 'b', 'c'), ['c', 'a', 'b']))).toEqual(['c', 'a', 'b']);
  });

  it('keeps new items in their natural position instead of moving them to the end', () => {
    // "live" arrived at the top and "d" came from a new page.
    const result = applyCustomOrder(items('live', 'a', 'b', 'c', 'd'), ['c', 'a', 'b']);
    expect(ids(result)).toEqual(['live', 'c', 'a', 'b', 'd']);
  });

  it('ignores saved ids that are no longer in the list', () => {
    expect(ids(applyCustomOrder(items('a', 'b'), ['gone', 'b', 'a']))).toEqual(['b', 'a']);
  });
});
