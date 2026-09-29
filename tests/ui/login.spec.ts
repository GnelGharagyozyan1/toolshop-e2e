import { test, expect } from '@playwright/test';
import { LoginPage } from '@pages/login.page';
import { env } from '@config/env';

test.describe('authentication', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test('a customer can sign in with valid credentials @smoke', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.openAndLogin(env.users.customer.email, env.users.customer.password);

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

    await expect(loginPage.header.userMenu).toBeHidden();
    await expect(loginPage.header.signInLink).toBeVisible();
  });

  test('a signed-in user can sign out', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.openAndLogin(env.users.customer.email, env.users.customer.password);
    await expect(loginPage.header.userMenu).toBeVisible();

    await loginPage.header.signOut();

    await expect(loginPage.header.signInLink).toBeVisible();
  });
});
