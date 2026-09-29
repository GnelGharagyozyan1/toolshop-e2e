import type { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';
import { HeaderComponent } from './components/header.component';

export class LoginPage extends BasePage {
  protected readonly path = '/auth/login';
  readonly header: HeaderComponent;

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

    this.forgotPasswordLink = page.getByRole('link', { name: /forgot your password/i });
    this.registerLink = page.getByRole('link', { name: /register your account/i });
  }

  async login(email: string, password: string): Promise<void> {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }

  async openAndLogin(email: string, password: string): Promise<void> {
    await this.open();
    await this.login(email, password);
  }
}
