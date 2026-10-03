import { expect, test } from '@playwright/test';
import { openFeed } from './helpers';

test.describe('Favorites', () => {
  test('favorite a card from the feed and find it on the Favorites page', async ({ page }) => {
    await openFeed(page);

    const card = page.getByTestId('feed-item').first();
    const title = (await card.getByRole('heading', { level: 3 }).textContent())?.trim() ?? '';
    await card.getByRole('button', { name: 'Favorite' }).click();
    await expect(card.getByRole('button', { name: 'Favorite' })).toHaveAttribute('aria-pressed', 'true');

    const nav = page.getByRole('navigation', { name: 'Main navigation' });
    await expect(nav.getByRole('link', { name: /Favorites/ })).toContainText('1');
    await nav.getByRole('link', { name: /Favorites/ }).click();

    await expect(page).toHaveURL(/\/favorites$/);
    await expect(page.getByRole('heading', { level: 3, name: title })).toBeVisible();

    // Still there after a reload (persisted in localStorage).
    await page.reload();
    await expect(page.getByRole('heading', { level: 3, name: title })).toBeVisible();

    await page.getByRole('button', { name: 'Favorite', pressed: true }).click();
    await expect(page.getByText('No favorites yet')).toBeVisible();
  });
});
