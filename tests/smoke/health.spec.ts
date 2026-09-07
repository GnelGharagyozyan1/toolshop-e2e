import { test, expect } from '@fixtures/test';
import { ProductsPage } from '@pages/products.page';

/**
 * Framework health checks.
 *
 * These prove the plumbing works: config resolves, baseURL applies, browsers
 * launch, the app responds. Deliberately shallow — feature coverage lives
 * elsewhere.
 *
 * Rewritten in Phase 6 to go through page objects. The original used raw
 * locators, which broke the layer rule our own README states. A framework's
 * conventions are only worth anything if they apply everywhere, including to
 * the file written before the convention existed.
 */
test.describe('framework health @smoke', () => {
  test('the application under test loads', async ({ page }) => {
    const products = new ProductsPage(page);
    await products.open();

    await expect(page).toHaveTitle(/practice software testing/i);
  });

  test('the product catalogue renders', async ({ page }) => {
    const products = new ProductsPage(page);
    await products.open();

    await expect(products.cards).toHaveCount(9);
  });

  test('the header renders its navigation', async ({ page }) => {
    const products = new ProductsPage(page);
    await products.open();

    await expect(products.header.homeLink).toBeVisible();
  });
});
