import type { Locator } from '@playwright/test';

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

  async getPriceText(): Promise<string> {
    return (await this.price.textContent())?.trim() ?? '';
  }

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
