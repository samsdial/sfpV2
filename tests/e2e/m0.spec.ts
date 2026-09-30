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

test.describe('M0 authenticated flow', () => {
  test.skip(!process.env.E2E_EMAIL, 'Set E2E_EMAIL and E2E_PASSWORD for auth E2E');

  test('login → ajustes → logout', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel(/correo/i).fill(process.env.E2E_EMAIL!);
    await page.getByLabel(/contraseña/i).fill(process.env.E2E_PASSWORD!);
    await page.getByRole('button', { name: /entrar/i }).click();
    await expect(page).toHaveURL('/');

    await page.goto('/ajustes');
    await expect(page.getByRole('heading', { name: /ajustes/i })).toBeVisible();

    await page.getByRole('button', { name: process.env.E2E_EMAIL!.split('@')[0] }).click();
    await page.getByRole('menuitem', { name: /cerrar sesión/i }).click();
    await expect(page).toHaveURL(/\/login/);
  });
});
