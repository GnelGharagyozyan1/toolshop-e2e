import { test, expect } from '@fixtures/test';
import { buildUser } from '@data/user.factory';
import { env } from '@config/env';
import type { RegisteredUser } from '@api/types';

test.describe('user registration API', () => {
  test('registers a new user with valid data @smoke', async ({ request }) => {
    const payload = buildUser();

    const response = await request.post(`${env.apiURL}/users/register`, { data: payload });

    expect(response.status()).toBe(201);

    const body = (await response.json()) as RegisteredUser;
    expect(body).toMatchObject({
      first_name: payload.first_name,
      last_name: payload.last_name,
      email: payload.email,
    });

    expect(body).not.toHaveProperty('password');
  });

  test('rejects a duplicate email address', async ({ request, newUser }) => {
    const duplicate = buildUser({ email: newUser.email });

    const response = await request.post(`${env.apiURL}/users/register`, { data: duplicate });

    expect(response.ok()).toBeFalsy();
    expect(response.status()).toBe(409);
  });

  test('rejects a malformed email address', async ({ request }) => {
    test.fail();

    const payload = buildUser({ email: 'not-an-email' });

    const response = await request.post(`${env.apiURL}/users/register`, { data: payload });

    expect(response.status()).toBe(422);
  });

  test('a newly registered user can authenticate', async ({ authApi, newUser }) => {
    const token = await authApi.login(newUser.email, newUser.password);

    expect(token).toBeTruthy();
    expect(token.split('.')).toHaveLength(3);
  });
});
