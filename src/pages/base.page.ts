import type { Page } from '@playwright/test';

/**
 * Base class for every Page Object.
 *
 * DESIGN WARNING — read this before adding anything here.
 *
 * The most common failure in Page Object frameworks is a bloated base class.
 * It starts with one helper, then someone adds `clickAndWait`, then
 * `getTextSafely`, and eighteen months later BasePage is 600 lines that every
 * page inherits and nobody dares touch.
 *
 * The rule for this file: something belongs here ONLY if it is genuinely true
 * for every single page in the application. Everything else lives on the
 * specific page, or in a component, or in a util.
 *
 * Notice what is deliberately absent:
 *   - no click()/fill() wrappers. Playwright's own API is already good;
 *     wrapping it hides the real call and breaks IDE autocomplete.
 *   - no waitForElement(). Playwright auto-waits. A custom wait helper is
 *     almost always a sign that someone is fighting the framework.
 *   - no assertions. Page Objects describe the page; tests judge it.
 */
export abstract class BasePage {
  /**
   * `protected readonly` in the constructor parameter list is TypeScript
   * shorthand: it declares the field, assigns it, and marks it read-only,
   * all in one line. Subclasses get `this.page`; tests do not.
   */
  constructor(protected readonly page: Page) {}

  /**
   * The path fragment this page lives at, relative to baseURL.
   *
   * This app is an Angular SPA using hash routing, so paths look like
   * '/#/auth/login'. Each page declares its own, and `open()` below uses it.
   * `abstract` means TypeScript will refuse to compile a page that forgets it.
   */
  protected abstract readonly path: string;

  /** Navigate directly to this page. */
  async open(): Promise<void> {
    await this.page.goto(this.path);
  }

  /**
   * Current URL. Exposed so tests can assert on navigation without reaching
   * into `page` themselves — that keeps the Playwright API out of spec files.
   */
  get url(): string {
    return this.page.url();
  }
}