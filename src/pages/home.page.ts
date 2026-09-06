import type { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';
import { HeaderComponent } from './components/header.component';

/**
 * The product catalogue / landing page.
 *
 * Demonstrates the pattern for LISTS, which is where most Page Objects get
 * clumsy. The instinct is to write getFirstProduct(), getSecondProduct(),
 * getProductCount()... Instead, expose the collection as one Locator and let
 * callers use Playwright's built-in list operations on it.
 */
export class HomePage extends BasePage {
  protected readonly path = '/';

  readonly header: HeaderComponent;

  // --- Locators --------------------------------------------------------

  /**
   * ONE locator matching MANY elements. This is normal and intended.
   * `productNames.first()`, `.nth(2)`, `.count()`, and
   * `expect(productNames).toHaveCount(9)` all work from this single field.
   */
  readonly productNames: Locator;
  readonly productPrices: Locator;
  readonly productCards: Locator;

  readonly searchInput: Locator;
  readonly searchSubmit: Locator;
  readonly searchReset: Locator;
  readonly sortDropdown: Locator;

  constructor(page: Page) {
    super(page);
    this.header = new HeaderComponent(page);

    this.productNames = page.getByTestId('product-name');
    this.productPrices = page.getByTestId('product-price');
    this.productCards = page.locator('a.card');

    this.searchInput = page.getByTestId('search-query');
    this.searchSubmit = page.getByTestId('search-submit');
    this.searchReset = page.getByTestId('search-reset');
    this.sortDropdown = page.getByTestId('sort');
  }

  // --- Actions ---------------------------------------------------------

  async search(term: string): Promise<void> {
    await this.searchInput.fill(term);
    await this.searchSubmit.click();
  }

  async sortBy(option: string): Promise<void> {
    await this.sortDropdown.selectOption(option);
  }

  async openProduct(name: string): Promise<void> {
    await this.productNames.filter({ hasText: name }).first().click();
  }

  // --- State -----------------------------------------------------------

  /**
   * Read every visible product name.
   *
   * `allTextContents()` does NOT auto-wait — it returns whatever matches right
   * now, including an empty array. That's a real trap: a test that reads a
   * list too early gets `[]` and an assertion like "no results contain X"
   * passes for entirely the wrong reason.
   *
   * The fix is to make the test wait on an assertion first, e.g.
   *   await expect(home.productNames.first()).toBeVisible();
   * before calling this.
   */
  async getProductNames(): Promise<string[]> {
    return this.productNames.allTextContents();
  }

  async getProductCount(): Promise<number> {
    return this.productNames.count();
  }
}