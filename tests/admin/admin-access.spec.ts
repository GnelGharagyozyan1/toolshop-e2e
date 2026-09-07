import { test, expect } from '@fixtures/test';
import { ProductsPage } from '@pages/products.page';

/**
 * Tests that require an ADMIN session.
 *
 * These get their session from the `admin` project in playwright.config.ts,
 * which loads a different storageState file than every other project. Nothing
 * in this file logs in — the role is a property of the project, not the test.
 *
 * That's the payoff of role-based projects: "run this suite as an admin" is a
 * config decision, not something each test has to remember to do.
 */
test.describe('admin access', () => {
  test('an admin session is active on the catalogue @smoke', async ({ page }) => {
    const products = new ProductsPage(page);
    await products.open();

    await expect(products.header.userMenu).toBeVisible();
    await expect(products.header.signInLink).toBeHidden();
  });
});
