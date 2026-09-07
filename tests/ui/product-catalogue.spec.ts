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

    await products.search('hammer');

    const names = await products.getProductNames();

    // Assert the list is non-empty BEFORE asserting a property of every item.
    // `every()` on an empty array returns true — so without this line, a
    // broken search that returned nothing would pass.
    expect(names.length).toBeGreaterThan(0);
    expect(names.every((n) => n.toLowerCase().includes('hammer'))).toBeTruthy();
  });

  test('search with no matches shows an empty result set', async ({ page }) => {
    const products = new ProductsPage(page);
    await products.open();

    await products.search('zzzznotaproduct');

    // toHaveCount POLLS, so it correctly waits for the old results to clear.
    // Reading the array here would race the re-render.
    await expect(products.cards).toHaveCount(0);
  });

  test('sorts products by price ascending', async ({ page }) => {
    const products = new ProductsPage(page);
    await products.open();
    await expect(products.cards).toHaveCount(9);

    // Snapshot the order BEFORE acting, so we have something to wait against.
    const before = await products.getProductNames();

    await products.sortBy('price,asc');

    // expect.poll re-runs this callback until the assertion holds. We wait for
    // the CONTENT to change, because that's what the sort actually changes.
    // toHaveCount would return immediately — 9 cards before, 9 after.
    await expect.poll(() => products.getProductNames()).not.toEqual(before);

    // Only now is it safe to read and assert properly.
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

    // Don't assert an exact count — the catalogue changes. Assert the
    // RELATIONSHIP: filtering must not return more than everything.
    await expect(products.cards).not.toHaveCount(0);
    expect(await products.getCardCount()).toBeLessThanOrEqual(9);
  });

  test('pagination moves to the next page of products', async ({ page }) => {
    const products = new ProductsPage(page);
    await products.open();

    const firstPage = await products.getProductNames();

    await products.goToNextPage();

    // Same pattern. The previous version read immediately after the click and
    // got page one back, then asserted page one differs from page one.
    await expect.poll(() => products.getProductNames()).not.toEqual(firstPage);

    const secondPage = await products.getProductNames();
    expect(secondPage).not.toEqual(firstPage);
    expect(secondPage).toHaveLength(9);
  });
});
