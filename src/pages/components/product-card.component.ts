import type { Locator } from '@playwright/test';

/**
 * A single product card.
 *
 * THE KEY DIFFERENCE FROM HeaderComponent: this takes a Locator, not a Page.
 *
 * There are nine of these on screen. A component built from `page` would have
 * to say "the first one" or "the third one" internally, which is fragile and
 * unreadable. Building it from a Locator means the CALLER decides which card,
 * and every locator inside is automatically scoped to that card's subtree:
 *
 *   const card = new ProductCardComponent(productsPage.cards.nth(2));
 *   await card.getName();     // that card's name, not the page's first
 *
 * `root.getByTestId('product-name')` searches only INSIDE root. That scoping
 * is what makes this pattern work, and it's the standard answer to "how do you
 * handle repeated elements?"
 */
export class ProductCardComponent {
  readonly name: Locator;
  readonly price: Locator;
  readonly outOfStockBadge: Locator;
  readonly co2Badge: Locator;

  constructor(private readonly root: Locator) {
    this.name = root.getByTestId('product-name');
    this.price = root.getByTestId('product-price');
    this.outOfStockBadge = root.getByTestId('out-of-stock');
    this.co2Badge = root.getByTestId('co2-rating-badge');
  }

  async open(): Promise<void> {
    await this.root.click();
  }

  async getName(): Promise<string> {
    return (await this.name.textContent())?.trim() ?? '';
  }

  /** The price as displayed, e.g. '$14.15'. */
  async getPriceText(): Promise<string> {
    return (await this.price.textContent())?.trim() ?? '';
  }

  /**
   * The price as a number.
   *
   * This matters more than it looks. Sorting assertions compare prices, and
   * comparing them as STRINGS is wrong: '$9.99' sorts after '$10.00'
   * lexically, because '9' > '1'. A sort test built on string comparison
   * fails against a correctly sorted list — and you'll blame the app.
   */
  async getPrice(): Promise<number> {
    const text = await this.getPriceText();
    const parsed = Number.parseFloat(text.replace(/[^0-9.]/g, ''));
    if (Number.isNaN(parsed)) {
      throw new Error(`Could not parse a price from "${text}"`);
    }
    return parsed;
  }

  async isOutOfStock(): Promise<boolean> {
    return (await this.outOfStockBadge.count()) > 0;
  }
}
