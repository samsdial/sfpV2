import { test, expect } from '@playwright/test';

test.describe('M0 smoke structure', () => {
  test('health endpoint responds', async ({ request }) => {
    const res = await request.get('/api/health');
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body).toHaveProperty('version');
    expect(body).toHaveProperty('db');
  });

  test('login page loads', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: 'Iniciar sesión' })).toBeVisible();
  });

  test('protected route redirects to login', async ({ page }) => {
    await page.goto('/ajustes');
    await expect(page).toHaveURL(/\/login/);
  });
});
