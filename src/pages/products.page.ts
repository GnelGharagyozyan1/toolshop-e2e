import type { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';
import { HeaderComponent } from './components/header.component';
import { FilterComponent } from './components/filter.component';
import { ProductCardComponent } from './components/product-card.component';

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

    this.cards = page.locator('[data-test^="product-01"]');

    this.productNames = page.getByTestId('product-name');
    this.searchInput = page.getByTestId('search-query');
    this.searchSubmit = page.getByTestId('search-submit');
    this.searchReset = page.getByTestId('search-reset');
    this.paginationNext = page.getByTestId('pagination-next');
    this.paginationPrev = page.getByTestId('pagination-prev');
  }

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

  card(index: number): ProductCardComponent {
    return new ProductCardComponent(this.cards.nth(index));
  }

  async getCardCount(): Promise<number> {
    return this.cards.count();
  }

  async getProductNames(): Promise<string[]> {
    await this.productNames.first().waitFor({ state: 'attached' });
    return (await this.productNames.allTextContents()).map((t) => t.trim());
  }
  async getPrices(): Promise<number[]> {
    const count = await this.getCardCount();
    const prices: number[] = [];
    for (let i = 0; i < count; i++) {
      prices.push(await this.card(i).getPrice());
    }
    return prices;
  }
}
