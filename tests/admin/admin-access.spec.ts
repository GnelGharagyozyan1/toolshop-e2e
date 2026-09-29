import { test, expect } from '@fixtures/test';
import { ProductsPage } from '@pages/products.page';

test.describe('admin access', () => {
  test('an admin session is active on the catalogue @smoke', async ({ page }) => {
    const products = new ProductsPage(page);
    await products.open();

    await expect(products.header.userMenu).toBeVisible();
    await expect(products.header.signInLink).toBeHidden();
  });
});
