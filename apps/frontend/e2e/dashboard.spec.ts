import { test, expect } from '@playwright/test';

test.use({ storageState: process.env.AUTH_STATE ?? '.auth/user.json' });

test.describe('Dashboard', () => {
  test('shows three module sections', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.getByText(/almacén/i)).toBeVisible({ timeout: 8000 });
    await expect(page.getByText(/farmacia/i)).toBeVisible();
    await expect(page.getByText(/sistemas tic/i)).toBeVisible();
  });

  test('report download links are present', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.getByText(/descargar informe pdf/i)).toBeVisible({ timeout: 6000 });
  });

  test('reports page loads and shows all three report cards', async ({ page }) => {
    await page.goto('/reportes');
    await expect(page.getByText(/inventario almacén/i)).toBeVisible();
    await expect(page.getByText(/stock farmacia/i)).toBeVisible();
    await expect(page.getByText(/informe ejecutivo/i)).toBeVisible();
  });

  test('sidebar links to Farmacia, Sistemas and Almacén', async ({ page }) => {
    await page.goto('/dashboard');
    // Sidebar should contain these navigation labels
    await expect(page.getByRole('link', { name: /farmacia/i }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: /almacén/i }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: /sistemas/i }).first()).toBeVisible();
  });
});
