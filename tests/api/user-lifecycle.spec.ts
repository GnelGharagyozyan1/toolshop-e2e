import { test, expect } from '@fixtures/test';
import { buildUser } from '@data/user.factory';
import { AuthApi } from '@api/auth.api';
import { env } from '@config/env';

test.describe('user lifecycle', () => {
  test('an admin can delete a user, after which login fails', async ({ request, adminToken }) => {
    const api = new AuthApi(request);
    const payload = buildUser();

    const user = await api.register(payload);
    expect(user.id).toBeTruthy();

    const token = await api.login(payload.email, payload.password);
    expect(token).toBeTruthy();

    const deleted = await api.deleteUser(user.id, adminToken);
    expect(deleted).toBeTruthy();

    const afterDelete = await request.post(`${env.apiURL}/users/login`, {
      data: { email: payload.email, password: payload.password },
    });
    expect(afterDelete.ok()).toBeFalsy();
  });

  test('deleting a user without an admin token is rejected', async ({ request, newUser }) => {
    const api = new AuthApi(request);

    const ownToken = await api.login(newUser.email, newUser.password);

    const deleted = await api.deleteUser(newUser.id, ownToken);

    expect(deleted).toBeFalsy();
  });
});
