import { test, expect } from '@fixtures/test';
import { LoginPage } from '@pages/login.page';

/**
 * THE HYBRID PATTERN: set up state through the API, verify it through the UI.
 *
 * The user is created by an API call in the fixture — about 300ms. The test
 * itself then does only the thing it's actually testing: logging in through
 * the real interface.
 *
 * Contrast with the naive version, which would fill in an eleven-field
 * registration form first. That version is 20x slower, and it fails whenever
 * the registration form breaks — reporting a login bug that doesn't exist.
 *
 * The principle: a test should exercise ONE thing through the UI. Everything
 * else it needs should arrive by the fastest route available.
 */
test.describe('newly registered users', () => {
  // These tests log in themselves, so they must start logged out.
  test.use({ storageState: { cookies: [], origins: [] } });

  test('can sign in through the UI immediately after registering', async ({ page, newUser }) => {
    const loginPage = new LoginPage(page);

    await loginPage.openAndLogin(newUser.email, newUser.password);

    await expect(loginPage.header.userMenu).toBeVisible();
    await expect(loginPage.header.userMenu).toContainText(newUser.first_name);
  });

  test('cannot sign in with the wrong password', async ({ page, newUser }) => {
    const loginPage = new LoginPage(page);

    await loginPage.openAndLogin(newUser.email, 'WrongPassword123!');

    await expect(loginPage.errorMessage).toBeVisible();
    await expect(loginPage.header.userMenu).toBeHidden();
  });
});
