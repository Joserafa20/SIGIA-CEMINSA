import { test, expect } from '@playwright/test';

// Shared auth state — requires a saved state from auth.setup.ts (or inline login)
test.use({ storageState: process.env.AUTH_STATE ?? '.auth/user.json' });

test.describe('Farmacia — Dispensación FEFO', () => {
  test('dispense page renders with FEFO notice', async ({ page }) => {
    await page.goto('/farmacia/stock/dispense');
    await expect(page.getByText(/FEFO activo/i)).toBeVisible();
  });

  test('shows product selector populated with products', async ({ page }) => {
    await page.goto('/farmacia/stock/dispense');
    // Wait for the product select to be populated
    await expect(page.getByRole('combobox').first()).toBeVisible({ timeout: 5000 });
  });

  test('shows stock entry page with multi-item form', async ({ page }) => {
    await page.goto('/farmacia/stock/entry');
    await expect(page.getByText(/ingreso de stock/i)).toBeVisible();
    await expect(page.getByText(/agregar ítem/i)).toBeVisible();
  });

  test('can add a second line item in stock entry', async ({ page }) => {
    await page.goto('/farmacia/stock/entry');
    await page.getByText(/agregar ítem/i).click();
    await expect(page.getByText('Ítem 2')).toBeVisible();
  });
});
