import type { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';
import { HeaderComponent } from './components/header.component';
import { FilterComponent } from './components/filter.component';
import { ProductCardComponent } from './components/product-card.component';

/**
 * Sort options, typed.
 *
 * These strings come from the live `<select>`. A union type means a typo is a
 * COMPILE error, not a runtime one — `selectOption('price,ASC')` would
 * otherwise fail deep inside a test with an unhelpful message.
 */
export type SortOption =
  'name,asc' | 'name,desc' | 'price,asc' | 'price,desc' | 'co2_rating,asc' | 'co2_rating,desc';

export class ProductsPage extends BasePage {
  protected readonly path = '/';

  readonly header: HeaderComponent;
  readonly filters: FilterComponent;

  readonly cards: Locator;
  readonly productNames: Locator;
  readonly searchInput: Locator;
  readonly searchSubmit: Locator;
  readonly searchReset: Locator;
  readonly paginationNext: Locator;
  readonly paginationPrev: Locator;

  constructor(page: Page) {
    super(page);
    this.header = new HeaderComponent(page);
    this.filters = new FilterComponent(page);

    // Each card carries `data-test="product-<ULID>"`. We can't know the ULIDs,
    // but a CSS attribute prefix match finds all of them regardless.
    // `^=` means "attribute value starts with".
    this.cards = page.locator('[data-test^="product-01"]');

    this.productNames = page.getByTestId('product-name');
    this.searchInput = page.getByTestId('search-query');
    this.searchSubmit = page.getByTestId('search-submit');
    this.searchReset = page.getByTestId('search-reset');
    this.paginationNext = page.getByTestId('pagination-next');
    this.paginationPrev = page.getByTestId('pagination-prev');
  }

  // --- Actions ---------------------------------------------------------

  async search(term: string): Promise<void> {
    await this.searchInput.fill(term);
    await this.searchSubmit.click();
  }

  async clearSearch(): Promise<void> {
    await this.searchReset.click();
  }

  async sortBy(option: SortOption): Promise<void> {
    await this.filters.sortDropdown.selectOption(option);
  }

  async goToNextPage(): Promise<void> {
    await this.paginationNext.click();
  }

  /** A component scoped to one card, by index. */
  card(index: number): ProductCardComponent {
    return new ProductCardComponent(this.cards.nth(index));
  }

  // --- State -----------------------------------------------------------

  async getCardCount(): Promise<number> {
    return this.cards.count();
  }

  /**
   * Every visible product name.
   *
   * THE allTextContents() TRAP, solved.
   *
   * `allTextContents()` does not auto-wait. Called a moment too early it
   * returns `[]`, and an assertion like "no result contains 'hammer'" then
   * passes against an empty list — green for entirely the wrong reason. Same
   * shape as the toBeHidden() problem from Phase 2: absence is ambiguous.
   *
   * Waiting for the first element to attach forces the list to exist before
   * we read it. Callers who expect ZERO results must not use this method —
   * they should assert `toHaveCount(0)` on the locator instead, which polls.
   */
  async getProductNames(): Promise<string[]> {
    await this.productNames.first().waitFor({ state: 'attached' });
    return (await this.productNames.allTextContents()).map((t) => t.trim());
  }

  /** Every visible price, parsed to numbers. */
  async getPrices(): Promise<number[]> {
    const count = await this.getCardCount();
    const prices: number[] = [];
    for (let i = 0; i < count; i++) {
      prices.push(await this.card(i).getPrice());
    }
    return prices;
  }
}
