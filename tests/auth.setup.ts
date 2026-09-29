import { test as setup, expect } from '@playwright/test';
import { LoginPage } from '@pages/login.page';
import { STORAGE_STATE } from '@config/paths';
import { env } from '@config/env';

setup('authenticate as customer', async ({ page }) => {
  const loginPage = new LoginPage(page);

  await loginPage.openAndLogin(env.users.customer.email, env.users.customer.password);

  await expect(loginPage.header.userMenu).toBeVisible();

  await page.context().storageState({ path: STORAGE_STATE.customer });
});

setup('authenticate as admin', async ({ page }) => {
  const loginPage = new LoginPage(page);

  await loginPage.openAndLogin(env.users.admin.email, env.users.admin.password);
  await expect(loginPage.header.userMenu).toBeVisible();

  await page.context().storageState({ path: STORAGE_STATE.admin });
});
