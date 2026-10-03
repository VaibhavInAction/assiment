import { expect, test } from '@playwright/test';
import { feedIds, openFeed } from './helpers';

test.describe('Dashboard', () => {
  test('feed mixes news, movies and social posts and loads more on scroll', async ({ page }) => {
    await openFeed(page);
    await expect(page.getByTestId('demo-data-badge')).toBeVisible();

    const cards = page.getByTestId('feed-item');
    await expect(cards.filter({ hasText: 'Read More' }).first()).toBeVisible();
    await expect(cards.filter({ hasText: 'Play Now' }).first()).toBeVisible();
    await expect(cards.filter({ hasText: 'View Post' }).first()).toBeVisible();

    const firstPageCount = (await feedIds(page)).length;
    await page.getByTestId('load-more').scrollIntoViewIfNeeded();
    await expect.poll(async () => (await feedIds(page)).length).toBeGreaterThan(firstPageCount);
  });

  test('sidebar navigates between sections', async ({ page }) => {
    await openFeed(page);
    const nav = page.getByRole('navigation', { name: 'Main navigation' });

    await nav.getByRole('link', { name: 'Trending' }).click();
    await expect(page.getByRole('heading', { level: 1, name: 'Trending now' })).toBeVisible();
    await expect(page.getByRole('heading', { level: 2, name: 'Top headlines' })).toBeVisible();
    await expect(nav.getByRole('link', { name: 'Trending' })).toHaveAttribute('aria-current', 'page');

    await nav.getByRole('link', { name: 'Settings' }).click();
    await expect(page.getByRole('heading', { level: 1, name: 'Settings' })).toBeVisible();
  });

  test('changing topics in settings personalizes the feed', async ({ page }) => {
    await page.goto('/settings');
    await page.getByRole('button', { name: 'Health' }).click();
    for (const topic of ['Technology', 'Business & Finance', 'Sports']) {
      await page.getByRole('button', { name: topic }).click();
    }

    await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'Your Feed' }).click();
    await expect(page.getByRole('list', { name: 'Your topics' }).first()).toHaveText('Health');
    await expect(page.getByTestId('feed-item').first()).toBeVisible();
  });

  test('dark mode toggles and persists across reloads', async ({ page }) => {
    await openFeed(page);
    const html = page.locator('html');
    const startDark = (await html.getAttribute('class'))?.includes('dark') ?? false;

    await page.getByTestId('theme-toggle').click();
    await expect(html).toHaveClass(startDark ? /^(?!.*\bdark\b)/ : /\bdark\b/);

    await page.waitForTimeout(400); // debounced save
    await page.reload();
    await expect(html).toHaveClass(startDark ? /^(?!.*\bdark\b)/ : /\bdark\b/);
  });

  test('language can be switched to Hindi', async ({ page }) => {
    await openFeed(page);
    await page.getByTestId('language-select').selectOption('hi');
    await expect(page.getByRole('heading', { level: 1, name: 'आपकी व्यक्तिगत फ़ीड' })).toBeVisible();
    await expect(page.locator('html')).toHaveAttribute('lang', 'hi');
  });

  test('mobile layout uses a slide-in navigation drawer', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await openFeed(page);

    await page.getByRole('button', { name: 'Open navigation' }).click();
    const drawer = page.getByRole('dialog', { name: 'Main navigation' });
    await expect(drawer).toBeVisible();
    await drawer.getByRole('link', { name: 'Favorites' }).click();

    await expect(page).toHaveURL(/\/favorites$/);
    await expect(drawer).toBeHidden();
  });
});
