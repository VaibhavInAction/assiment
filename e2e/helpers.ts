import { expect, type Page } from '@playwright/test';

const STORAGE_KEY = 'pulseboard:v1';

/** Opens the feed and waits until the first page of cards has rendered. */
export async function openFeed(page: Page) {
  await page.goto('/');
  await expect(page.getByTestId('feed-item').first()).toBeVisible();
}

export async function feedIds(page: Page): Promise<string[]> {
  return page.getByTestId('feed-item').evaluateAll((items) => items.map((item) => item.getAttribute('data-id') ?? ''));
}

/** Resolves once the debounced localStorage write has happened. */
export async function savedState(page: Page) {
  let state: Record<string, unknown> | null = null;
  await expect
    .poll(async () => {
      state = await page.evaluate((key) => JSON.parse(localStorage.getItem(key) ?? 'null'), STORAGE_KEY);
      return state !== null;
    })
    .toBe(true);
  return state as unknown as Record<string, unknown>;
}
