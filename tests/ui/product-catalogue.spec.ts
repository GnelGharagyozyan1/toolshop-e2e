import { test, expect } from '@fixtures/test';
import { ProductsPage } from '@pages/products.page';

test.describe('product catalogue', () => {
  test('shows nine products on the first page @smoke', async ({ page }) => {
    const products = new ProductsPage(page);
    await products.open();

    await expect(products.cards).toHaveCount(9);
  });

  test('search returns only matching products', async ({ page }) => {
    const products = new ProductsPage(page);
    await products.open();
    await expect(products.cards).toHaveCount(9);
    const before = await products.getProductNames();

    await products.search('hammer');

    await expect.poll(() => products.getProductNames()).not.toEqual(before);

    const names = await products.getProductNames();

    expect(names.length).toBeGreaterThan(0);
    expect(names.every((n) => n.toLowerCase().includes('hammer'))).toBeTruthy();
  });

  test('search with no matches shows an empty result set', async ({ page }) => {
    const products = new ProductsPage(page);
    await products.open();

    await products.search('zzzznotaproduct');

    await expect(products.cards).toHaveCount(0);
  });

  test('sorts products by price ascending', async ({ page }) => {
    const products = new ProductsPage(page);
    await products.open();
    await expect(products.cards).toHaveCount(9);

    const before = await products.getProductNames();

    await products.sortBy('price,asc');

    await expect.poll(() => products.getProductNames()).not.toEqual(before);

    const prices = await products.getPrices();
    expect(prices).toEqual([...prices].sort((a, b) => a - b));
  });

  test('sorts products by name descending', async ({ page }) => {
    const products = new ProductsPage(page);
    await products.open();
    await expect(products.cards).toHaveCount(9);

    const before = await products.getProductNames();

    await products.sortBy('name,desc');
    await expect.poll(() => products.getProductNames()).not.toEqual(before);

    const names = await products.getProductNames();
    expect(names).toEqual([...names].sort((a, b) => b.localeCompare(a)));
  });

  test('filtering by category narrows the results', async ({ page }) => {
    const products = new ProductsPage(page);
    await products.open();
    await expect(products.cards).toHaveCount(9);

    await products.filters.selectCategory('Hand Tools');

    await expect(products.cards).not.toHaveCount(0);
    expect(await products.getCardCount()).toBeLessThanOrEqual(9);
  });

  test('pagination moves to the next page of products', async ({ page }) => {
    const products = new ProductsPage(page);
    await products.open();

    const firstPage = await products.getProductNames();

    await products.goToNextPage();

    await expect.poll(() => products.getProductNames()).not.toEqual(firstPage);

    const secondPage = await products.getProductNames();
    expect(secondPage).not.toEqual(firstPage);
    expect(secondPage).toHaveLength(9);
  });
});
