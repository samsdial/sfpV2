import { test, expect } from '@playwright/test';

test.describe('M1 ledger', () => {
  test.skip(!process.env.E2E_EMAIL, 'Set E2E_EMAIL and E2E_PASSWORD');

  test('movimientos page loads when authenticated', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel(/correo/i).fill(process.env.E2E_EMAIL!);
    await page.getByLabel(/contraseña/i).fill(process.env.E2E_PASSWORD!);
    await page.getByRole('button', { name: /entrar/i }).click();

    await page.goto('/movimientos');
    await expect(page.getByRole('heading', { name: 'Movimientos' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Filtrar' })).toBeVisible();
  });

  test('quick-add opens with N shortcut', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel(/correo/i).fill(process.env.E2E_EMAIL!);
    await page.getByLabel(/contraseña/i).fill(process.env.E2E_PASSWORD!);
    await page.getByRole('button', { name: /entrar/i }).click();

    await page.keyboard.press('n');
    await expect(page.getByRole('heading', { name: /registro rápido/i })).toBeVisible();
  });
});
