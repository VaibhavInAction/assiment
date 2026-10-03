import { expect, test } from '@playwright/test';
import { feedIds, openFeed, savedState } from './helpers';

test.describe('Drag-and-drop reordering', () => {
  test('dragging a card onto another moves it, and the order survives a reload', async ({ page }) => {
    await openFeed(page);
    const before = await feedIds(page);
    expect(before.length).toBeGreaterThanOrEqual(3);

    const first = page.locator(`[data-testid="feed-item"][data-id="${before[0]}"]`);
    const third = page.locator(`[data-testid="feed-item"][data-id="${before[2]}"]`);
    await first.dragTo(third);

    const expected = [before[1], before[2], before[0], ...before.slice(3)];
    await expect.poll(() => feedIds(page)).toEqual(expected);

    const state = await savedState(page);
    expect((state.feedOrder as string[]).slice(0, 3)).toEqual(expected.slice(0, 3));

    await page.reload();
    await expect(page.getByTestId('feed-item').first()).toBeVisible();
    expect((await feedIds(page)).slice(0, 3)).toEqual(expected.slice(0, 3));

    await page.getByRole('button', { name: 'Reset order' }).click();
    await expect.poll(async () => (await feedIds(page)).slice(0, 3)).toEqual(before.slice(0, 3));
  });

  test('cards can be reordered with the keyboard', async ({ page }) => {
    await openFeed(page);
    const before = await feedIds(page);

    const firstCard = page.getByTestId('feed-item').first();
    const moveLater = firstCard.getByRole('button', { name: 'Move later' });
    await moveLater.focus();
    await page.keyboard.press('Enter');

    await expect.poll(async () => (await feedIds(page)).slice(0, 2)).toEqual([before[1], before[0]]);
    // Screen readers hear where the card went.
    await expect(page.getByText(/to position 2$/)).toBeAttached();
  });
});
