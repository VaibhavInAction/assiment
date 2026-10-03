import { describe, expect, it } from 'vitest';
import {
  MAX_PAGES,
  parseCategories,
  parseCategoryOrAll,
  parseFilter,
  parsePage,
  parseQuery,
  parseSources,
} from './params';

describe('request parameter parsing', () => {
  it('clamps pages to 1..MAX_PAGES', () => {
    expect(parsePage(null)).toBe(1);
    expect(parsePage('-3')).toBe(1);
    expect(parsePage('abc')).toBe(1);
    expect(parsePage('4')).toBe(4);
    expect(parsePage('9999')).toBe(MAX_PAGES);
  });

  it('keeps only valid categories, de-duplicated and in canonical order', () => {
    expect(parseCategories('sports,technology,sports,<script>')).toEqual(['technology', 'sports']);
    expect(parseCategories('')).toEqual(['general']);
    expect(parseCategories(null)).toEqual(['general']);
  });

  it('defaults to every source when none or only invalid ones are given', () => {
    expect(parseSources(null)).toEqual(['news', 'social']);
    expect(parseSources('evil')).toEqual(['news', 'social']);
    expect(parseSources('social')).toEqual(['social']);
    expect(parseSources('social,news')).toEqual(['news', 'social']);
  });

  it('normalizes whitespace and caps query length', () => {
    expect(parseQuery('  space    news ')).toBe('space news');
    expect(parseQuery('x'.repeat(500))).toHaveLength(100);
  });

  it('accepts only known filters and categories', () => {
    expect(parseFilter('social')).toBe('social');
    expect(parseFilter('drop table')).toBe('all');
    expect(parseCategoryOrAll('science')).toBe('science');
    expect(parseCategoryOrAll('nope')).toBe('all');
  });
});
