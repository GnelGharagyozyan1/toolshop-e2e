import type { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';
import { HeaderComponent } from './components/header.component';

/**
 * The sign-in screen.
 *
 * A Page Object has exactly three kinds of members:
 *   LOCATORS  — where things are
 *   ACTIONS   — what a user can do
 *   STATE     — what the page currently shows
 *
 * It has no assertions and no test logic. If you find yourself writing an
 * `if` in here, the page is trying to make a decision that belongs to a test.
 */
export class LoginPage extends BasePage {
  protected readonly path = '/auth/login';
  /** Composition: the page HAS a header. */
  readonly header: HeaderComponent;

  // --- Locators --------------------------------------------------------
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly errorMessage: Locator;
  readonly forgotPasswordLink: Locator;
  readonly registerLink: Locator;

  constructor(page: Page) {
    super(page);
    this.header = new HeaderComponent(page);

    this.emailInput = page.getByTestId('email');
    this.passwordInput = page.getByTestId('password');
    this.submitButton = page.getByTestId('login-submit');
    this.errorMessage = page.getByTestId('login-error');

    // Not every element has a test id. For these we fall back up the priority
    // list to getByRole, which is the right call for user-facing navigation.
    this.forgotPasswordLink = page.getByRole('link', { name: /forgot your password/i });
    this.registerLink = page.getByRole('link', { name: /register your account/i });
  }

  // --- Actions ---------------------------------------------------------

  /**
   * Fill and submit the form.
   *
   * Note what this does NOT do: it doesn't wait for navigation, and it doesn't
   * check whether login succeeded. It performs the user's action and stops.
   * Success and failure are both legitimate outcomes, and deciding between
   * them is the test's job — which is what lets one method serve both the
   * happy path and every negative case.
   */
  async login(email: string, password: string): Promise<void> {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }

  /** Convenience: navigate here first, then log in. */
  async openAndLogin(email: string, password: string): Promise<void> {
    await this.open();
    await this.login(email, password);
  }
}