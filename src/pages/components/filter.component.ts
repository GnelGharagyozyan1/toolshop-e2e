import type { Page, Locator } from '@playwright/test';

export class FilterComponent {
  readonly root: Locator;
  readonly sortDropdown: Locator;
  readonly ecoFriendlyToggle: Locator;

  constructor(page: Page) {
    this.root = page.getByTestId('filters');
    this.sortDropdown = page.getByTestId('sort');
    this.ecoFriendlyToggle = page.getByTestId('eco-friendly-filter');
  }

  async selectCategory(label: string): Promise<void> {
    await this.root.getByLabel(label, { exact: true }).check();
  }

  async deselectCategory(label: string): Promise<void> {
    await this.root.getByLabel(label, { exact: true }).uncheck();
  }

  async selectBrand(label: string): Promise<void> {
    await this.root.getByLabel(label, { exact: true }).check();
  }

  async isChecked(label: string): Promise<boolean> {
    return this.root.getByLabel(label, { exact: true }).isChecked();
  }
}
