import type { Page, Locator } from '@playwright/test';

/**
 * The category / brand / price filter sidebar.
 *
 * LOCATING BY LABEL, NOT BY TEST ID.
 *
 * The reconnaissance showed filters carry ids like
 * `category-01M1YQA8GF9JGATTCD46935BXV` — a ULID from the database. Those are
 * unusable: they change on reseed, they differ between environments, and
 * `page.getByTestId('category-01M1YQ...')` in a test file tells a reader
 * nothing about what is being filtered.
 *
 * `getByLabel('Hand Tools')` reads as the requirement and survives a reseed.
 *
 * The general principle: prefer a locator a HUMAN could have written from
 * looking at the screen. Generated ids fail that test even when they're
 * technically stable.
 */
export class FilterComponent {
  readonly root: Locator;
  readonly sortDropdown: Locator;
  readonly ecoFriendlyToggle: Locator;

  constructor(page: Page) {
    this.root = page.getByTestId('filters');
    this.sortDropdown = page.getByTestId('sort');
    this.ecoFriendlyToggle = page.getByTestId('eco-friendly-filter');
  }

  /** Tick a category checkbox by its visible label. */
  async selectCategory(label: string): Promise<void> {
    await this.root.getByLabel(label, { exact: true }).check();
  }

  async deselectCategory(label: string): Promise<void> {
    await this.root.getByLabel(label, { exact: true }).uncheck();
  }

  /** Brands and categories share the same markup, so this is the same call. */
  async selectBrand(label: string): Promise<void> {
    await this.root.getByLabel(label, { exact: true }).check();
  }

  async isChecked(label: string): Promise<boolean> {
    return this.root.getByLabel(label, { exact: true }).isChecked();
  }
}
