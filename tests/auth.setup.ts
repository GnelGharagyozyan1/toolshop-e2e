import { test as setup, expect } from '@playwright/test';
import { LoginPage } from '@pages/login.page';
import { STORAGE_STATE } from '@config/paths';
import { env } from '@config/env';

/**
 * Authentication setup.
 *
 * This is a real Playwright test file, but it runs as its own PROJECT that
 * every other project depends on. It executes once per run, before anything
 * else, and its only job is to produce the session files on disk.
 *
 * WHAT storageState ACTUALLY SAVES
 *
 *   - cookies
 *   - localStorage (per origin)
 *
 * That second one matters here. This app is an Angular SPA that keeps its
 * JWT in localStorage, not in a cookie. A setup that only captured cookies
 * would silently produce a file that restores nothing.
 *
 * WHY WE LOG IN THROUGH THE UI HERE
 *
 * Hitting the API directly would be faster, but Playwright's APIRequestContext
 * only captures cookies — it never sees localStorage, because no browser was
 * involved. Driving the real UI once gives us a complete, correct session
 * with no guessing about storage keys. It costs ~3 seconds, once per run.
 */

setup('authenticate as customer', async ({ page }) => {
  const loginPage = new LoginPage(page);

  await loginPage.openAndLogin(env.users.customer.email, env.users.customer.password);

  // CRITICAL: wait for login to actually complete before saving.
  // storageState() is a snapshot of RIGHT NOW. Save it a moment too early
  // and you write a file with no token in it — and every downstream test
  // then fails with a confusing "not logged in", far from the real cause.
  await expect(loginPage.header.userMenu).toBeVisible();

  await page.context().storageState({ path: STORAGE_STATE.customer });
});

setup('authenticate as admin', async ({ page }) => {
  const loginPage = new LoginPage(page);

  await loginPage.openAndLogin(env.users.admin.email, env.users.admin.password);
  await expect(loginPage.header.userMenu).toBeVisible();

  await page.context().storageState({ path: STORAGE_STATE.admin });
});
