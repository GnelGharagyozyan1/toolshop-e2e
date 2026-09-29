import { test, expect } from '@fixtures/test';
import { ProductsPage } from '@pages/products.page';

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
