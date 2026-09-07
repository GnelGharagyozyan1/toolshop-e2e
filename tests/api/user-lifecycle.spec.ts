import { test, expect } from '@fixtures/test';
import { buildUser } from '@data/user.factory';
import { AuthApi } from '@api/auth.api';
import { env } from '@config/env';

/**
 * Verifies the cleanup mechanism itself.
 *
 * The `newUser` fixture deletes its account on teardown, but teardown runs
 * AFTER the test body — so a test using that fixture can never observe its own
 * deletion. This test therefore drives the full lifecycle manually.
 *
 * Testing your own test infrastructure feels redundant until the day cleanup
 * silently stops working and you don't notice for three months.
 */
test.describe('user lifecycle', () => {
  test('an admin can delete a user, after which login fails', async ({ request, adminToken }) => {
    const api = new AuthApi(request);
    const payload = buildUser();

    const user = await api.register(payload);
    expect(user.id).toBeTruthy();

    // The account works before deletion.
    const token = await api.login(payload.email, payload.password);
    expect(token).toBeTruthy();

    const deleted = await api.deleteUser(user.id, adminToken);
    expect(deleted).toBeTruthy();

    // And is gone after. We call the endpoint directly rather than
    // api.login(), because that helper throws on failure — here the failure
    // IS the expected result, so we want the raw response.
    const afterDelete = await request.post(`${env.apiURL}/users/login`, {
      data: { email: payload.email, password: payload.password },
    });
    expect(afterDelete.ok()).toBeFalsy();
  });

  test('deleting a user without an admin token is rejected', async ({ request, newUser }) => {
    const api = new AuthApi(request);

    // A regular user's own token must not be enough to delete an account.
    const ownToken = await api.login(newUser.email, newUser.password);

    const deleted = await api.deleteUser(newUser.id, ownToken);

    // Authorization is enforced server-side, so this must fail.
    expect(deleted).toBeFalsy();
  });
});
