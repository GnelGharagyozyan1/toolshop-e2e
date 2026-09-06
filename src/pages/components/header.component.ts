import type { Page, Locator } from '@playwright/test';

/**
 * The site header, present on every page.
 *
 * WHY THIS IS A COMPONENT AND NOT PART OF BasePage
 *
 * The tempting move is to put these locators on BasePage so every page
 * inherits them. Don't. Inheritance says "a LoginPage IS a header", which is
 * false. Composition says "a LoginPage HAS a header", which is true.
 *
 * The practical difference shows up the first time something changes:
 *   - the header markup changes  -> you edit this one file
 *   - a page has no header -> it simply doesn't compose one, instead of
 *     inheriting members it must ignore
 *   - you want to test the header in isolation -> you can
 */
export class HeaderComponent {
  // ---------------------------------------------------------------------
  // LOCATORS
  //
  // Declared as readonly fields, resolved once at construction. This is safe
  // because a Locator is LAZY — creating one queries nothing. It's a recipe
  // for finding an element, not the element itself. The DOM is only touched
  // when you act on it (click, fill) or assert on it.
  // ---------------------------------------------------------------------

  /**
   * Playwright's locator priority order:
   *   1. getByRole        — queries the accessibility tree
   *   2. getByLabel       — form controls, by their visible label
   *   3. getByPlaceholder
   *   4. getByText
   *   5. getByTestId      — explicit test contract
   *   6. CSS / XPath      — last resort
   *
   * getByTestId overtakes the others when the app deliberately ships test
   * attributes, as this one does. Use roles to assert what the USER sees;
   * use test IDs to drive the app.
   */
  readonly homeLink: Locator;
  readonly signInLink: Locator;
  readonly userMenu: Locator;
  readonly signOutLink: Locator;
  readonly cartLink: Locator;
  readonly cartQuantity: Locator;

  constructor(page: Page) {
    this.homeLink = page.getByTestId('nav-home');
    this.signInLink = page.getByTestId('nav-sign-in');
    this.userMenu = page.getByTestId('nav-menu');
    this.signOutLink = page.getByTestId('nav-sign-out');
    this.cartLink = page.getByTestId('nav-cart');
    this.cartQuantity = page.getByTestId('cart-quantity');
  }

  // --- Actions ---------------------------------------------------------

  async goToSignIn(): Promise<void> {
    await this.signInLink.click();
  }

  async signOut(): Promise<void> {
    await this.userMenu.click();
    await this.signOutLink.click();
  }

  // --- State -----------------------------------------------------------
  // These RETURN information; they never assert on it. A method named
  // `verifyUserIsLoggedIn()` would move the requirement out of the spec file
  // and into a helper, which is exactly where requirements go to hide.

  /** The signed-in user's display name, as shown in the header menu. */
  async getUserName(): Promise<string> {
    return (await this.userMenu.textContent())?.trim() ?? '';
  }
}