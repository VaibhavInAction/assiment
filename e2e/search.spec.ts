import { expect, test } from '@playwright/test';
import { openFeed } from './helpers';

test.describe('Search', () => {
  test('debounced header search opens results across news and posts', async ({ page }) => {
    await openFeed(page);

    const requests: string[] = [];
    page.on('request', (request) => {
      if (request.url().includes('/api/search')) requests.push(request.url());
    });

    await page.getByRole('searchbox', { name: 'Search content' }).pressSequentially('space', { delay: 40 });

    await expect(page).toHaveURL(/\/search$/);
    await expect(page.getByRole('heading', { level: 1, name: 'Search' })).toBeVisible();
    await expect(page.getByText('Results for “space”')).toBeVisible();

    const cards = page.getByTestId('content-card');
    await expect(cards.first()).toBeVisible();
    await expect(cards.filter({ hasText: 'News' }).first()).toBeVisible();
    await expect(cards.filter({ hasText: 'Social' }).first()).toBeVisible();

    // Debounced: one request for the full word, not one per keystroke.
    expect(requests).toHaveLength(1);
    expect(requests[0]).toContain('q=space');
  });

  test('filters results by type', async ({ page }) => {
    await openFeed(page);
    await page.getByRole('searchbox', { name: 'Search content' }).fill('the');
    await expect(page).toHaveURL(/\/search$/);
    await expect(page.getByTestId('content-card').first()).toBeVisible();

    await page.getByRole('button', { name: 'Social', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Social', exact: true })).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByRole('link', { name: /Read More/ })).toHaveCount(0);
    await expect(page.getByRole('link', { name: /View Post/ }).first()).toBeVisible();
  });

  test('shows an empty state when nothing matches', async ({ page }) => {
    await openFeed(page);
    await page.getByRole('searchbox', { name: 'Search content' }).fill('qwxzzzq');
    await expect(page.getByText('No results found')).toBeVisible();
  });

  test('"/" focuses the search box and Escape clears it', async ({ page }) => {
    await openFeed(page);
    await page.keyboard.press('/');
    const search = page.getByRole('searchbox', { name: 'Search content' });
    await expect(search).toBeFocused();

    await search.fill('cricket');
    await search.press('Escape');
    await expect(search).toHaveValue('');
  });
});
