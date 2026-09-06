import { test, expect } from '@playwright/test';
import { env } from '@config/env';

/**
 * Phase 1 smoke tests.
 *
 * These prove the FRAMEWORK works: config resolves, baseURL applies, browsers
 * launch, the app and API respond, reporters write output. They are deliberately
 * shallow. Real feature tests arrive in Phase 3, built on Page Objects.
 *
 * The @smoke tag lets CI run these alone as a fast pre-flight:
 *   npm run test:smoke
 */
test.describe('framework health @smoke', () => {
  test('the application under test loads', async ({ page }) => {
    // No host here — `use.baseURL` from playwright.config supplies it.
    // This is why switching environments is a one-variable change.
    await page.goto('/');

    // A web-first assertion: it re-polls until it passes or the expect timeout
    // is reached. This is why arbitrary waits are never necessary.
    await expect(page).toHaveTitle(/practice software testing/i);
  });

  test('the product catalogue renders', async ({ page }) => {
    await page.goto('/');

    // This app ships `data-test` attributes specifically for automation, so we
    // use them. When an app gives you a stable contract for testing, take it —
    // it is more reliable than any CSS selector and it survives redesigns.
    //
    // In Phase 2 we'll cover the full locator priority order and when
    // getByRole is the better choice.
    await expect(page.locator('[data-test="product-name"]').first()).toBeVisible();
  });

  test('the API responds', async ({ request }) => {
    // The `request` fixture is a standalone HTTP client with no browser
    // attached. API checks run in milliseconds instead of seconds.
    const response = await request.get(`${env.apiURL}/products`);

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);
  });

  test('the API accepts the seeded customer credentials', async ({ request }) => {
    // Verifies the credentials in .env are valid before the whole suite
    // fails 40 tests later with a confusing "not logged in" error.
    const response = await request.post(`${env.apiURL}/users/login`, {
      data: {
        email: env.users.customer.email,
        password: env.users.customer.password,
      },
    });

    expect(response.ok()).toBeTruthy();
  });
});
