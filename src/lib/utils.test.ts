import { describe, expect, it } from 'vitest';
import { cn, dedupeById, formatRelativeTime, hashString, interleave } from './utils';

describe('hashString', () => {
  it('is stable and distinguishes inputs', () => {
    expect(hashString('https://a.com/1')).toBe(hashString('https://a.com/1'));
    expect(hashString('https://a.com/1')).not.toBe(hashString('https://a.com/2'));
  });
});

describe('formatRelativeTime', () => {
  const now = new Date('2026-06-15T12:00:00Z').getTime();

  it('formats past times in the requested locale', () => {
    expect(formatRelativeTime('2026-06-15T09:00:00Z', 'en', now)).toBe('3 hours ago');
    expect(formatRelativeTime('2026-06-14T12:00:00Z', 'en', now)).toBe('yesterday');
    expect(formatRelativeTime('2026-06-14T12:00:00Z', 'es', now)).toBe('ayer');
  });

  it('returns an empty string for invalid dates', () => {
    expect(formatRelativeTime('not a date', 'en', now)).toBe('');
  });
});

describe('interleave', () => {
  it('round-robins lists of different lengths without dropping items', () => {
    expect(interleave<number | string | boolean>([1, 2, 3], ['a'], [true, false])).toEqual([1, 'a', true, 2, false, 3]);
  });

  it('handles no lists', () => {
    expect(interleave()).toEqual([]);
  });
});

describe('dedupeById', () => {
  it('keeps the first occurrence', () => {
    const result = dedupeById([
      { id: 'a', n: 1 },
      { id: 'b', n: 2 },
      { id: 'a', n: 3 },
    ]);
    expect(result).toEqual([
      { id: 'a', n: 1 },
      { id: 'b', n: 2 },
    ]);
  });
});

describe('cn', () => {
  it('joins truthy class names', () => {
    expect(cn('a', false, null, undefined, 'b')).toBe('a b');
  });
});
