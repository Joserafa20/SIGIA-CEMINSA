import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('redirects unauthenticated users to /login', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login/);
  });

  test('shows login form on /login', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: /iniciar sesión/i })).toBeVisible();
    await expect(page.getByLabel(/correo/i)).toBeVisible();
    await expect(page.getByLabel(/contraseña/i)).toBeVisible();
  });

  test('shows error on invalid credentials', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel(/correo/i).fill('invalid@test.com');
    await page.getByLabel(/contraseña/i).fill('wrongpassword');
    await page.getByRole('button', { name: /ingresar/i }).click();
    await expect(page.getByText(/credenciales inválidas/i)).toBeVisible({ timeout: 5000 });
  });

  test('successful login redirects to dashboard', async ({ page }) => {
    // Uses seeded test credentials
    await page.goto('/login');
    await page.getByLabel(/correo/i).fill(process.env.TEST_USER_EMAIL ?? 'admin@ceminsa.gov.co');
    await page.getByLabel(/contraseña/i).fill(process.env.TEST_USER_PASSWORD ?? 'Admin1234!');
    await page.getByRole('button', { name: /ingresar/i }).click();
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 8000 });
  });
});
