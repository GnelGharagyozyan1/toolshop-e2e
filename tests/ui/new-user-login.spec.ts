import { test, expect } from '@fixtures/test';
import { LoginPage } from '@pages/login.page';

test.describe('newly registered users', () => {
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
