import { test, expect } from '@playwright/test';
import { LoginPage } from '@pages/login.page';
import { env } from '@config/env';

/**
 * Authentication tests.
 *
 * Read any test below and notice: there is not a single locator, selector, or
 * URL in this file. It reads as a description of behaviour. That is the entire
 * point of the Page Object Model — not code reuse, READABILITY. Reuse is a
 * side effect.
 *
 * If the sign-in form is redesigned tomorrow, this file does not change.
 */
test.describe('authentication', () => {
  // These tests exercise the login flow itself, so they must start logged OUT.
  // This overrides the project-level storageState with an empty session.
  test.use({ storageState: { cookies: [], origins: [] } });
  test('a customer can sign in with valid credentials @smoke', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.openAndLogin(env.users.customer.email, env.users.customer.password);

    // ASSERT ON OBSERVABLE STATE, NOT ON THE URL.
    //
    // `expect(page).toHaveURL('/#/account')` would also pass here, but it
    // asserts an implementation detail. If the team changes the post-login
    // route, that test fails despite nothing being broken from the user's
    // perspective. The user menu appearing IS "I am signed in".
    await expect(loginPage.header.userMenu).toBeVisible();
    await expect(loginPage.header.signInLink).toBeHidden();
  });

  test('an admin can sign in with valid credentials', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.openAndLogin(env.users.admin.email, env.users.admin.password);

    await expect(loginPage.header.userMenu).toBeVisible();
  });

  test('sign-in is rejected with a wrong password', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.openAndLogin(env.users.customer.email, 'definitely-not-the-password');

    // The negative assertion that matters most: we did NOT get in.
    // A test that only checks for an error message would still pass if the
    // app showed the error AND logged the user in anyway.
    await expect(loginPage.header.userMenu).toBeHidden();
    await expect(loginPage.header.signInLink).toBeVisible();

    // EXERCISE FOR YOU:
    // Add an assertion that the error message is displayed with the right text.
    // I guessed the locator `getByTestId('login-error')` in login.page.ts
    // without verifying it. Find the real one using the VS Code Playwright
    // extension's "Pick locator" button, fix it if I got it wrong, then
    // uncomment and complete this line:
    //
    // await expect(loginPage.errorMessage).toContainText(/invalid/i);
  });

  test('a signed-in user can sign out', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.openAndLogin(env.users.customer.email, env.users.customer.password);
    await expect(loginPage.header.userMenu).toBeVisible();

    await loginPage.header.signOut();

    await expect(loginPage.header.signInLink).toBeVisible();
  });
});
