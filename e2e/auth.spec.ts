import { expect, test } from '@playwright/test';

test.describe('Mock authentication', () => {
  test('validates the form, signs in, persists the session and signs out', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'Sign in' }).click();
    await expect(page).toHaveURL(/\/login$/);

    await page.getByRole('button', { name: 'Sign in', exact: true }).click();
    await expect(page.getByText('Please enter a valid email address.')).toBeVisible();
    await expect(page.getByLabel('Email')).toBeFocused();

    await page.getByLabel('Email').fill('jane.doe@example.com');
    await page.getByLabel('Password').fill('secret123');
    await page.getByRole('button', { name: 'Sign in', exact: true }).click();

    await expect(page).toHaveURL(/\/$/);
    const accountButton = page.getByTestId('user-menu-button');
    await expect(accountButton).toContainText('Jane Doe');

    await page.reload();
    await expect(accountButton).toContainText('Jane Doe');

    await accountButton.click();
    await page.getByRole('button', { name: 'Sign out' }).click();
    await expect(page.getByRole('link', { name: 'Sign in' })).toBeVisible();
  });

  test('demo account signs in with one click', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('button', { name: 'Continue with demo account' }).click();
    await expect(page.getByTestId('user-menu-button')).toContainText('Demo User');
  });
});
