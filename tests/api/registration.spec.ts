import { test, expect } from '@fixtures/test';
import { buildUser } from '@data/user.factory';
import { env } from '@config/env';

/**
 * API-level tests.
 *
 * These run in milliseconds and need no browser. As a rule, push coverage down
 * to this layer wherever you can: validation rules, error codes, and business
 * logic are all cheaper and more reliable to test here. Reserve UI tests for
 * things that genuinely require a UI.
 */
test.describe('user registration API', () => {
  test('registers a new user with valid data @smoke', async ({ request }) => {
    const payload = buildUser();

    const response = await request.post(`${env.apiURL}/users/register`, { data: payload });

    expect(response.status()).toBe(201);

    const body = await response.json();
    expect(body).toMatchObject({
      first_name: payload.first_name,
      last_name: payload.last_name,
      email: payload.email,
    });

    // The API must never echo the password back.
    expect(body).not.toHaveProperty('password');
  });

  test('rejects a duplicate email address', async ({ request, newUser }) => {
    // `newUser` already exists — the fixture created it. Now try again
    // with the same address.
    const duplicate = buildUser({ email: newUser.email });

    const response = await request.post(`${env.apiURL}/users/register`, { data: duplicate });

    expect(response.ok()).toBeFalsy();
    expect(response.status()).toBe(409);
  });

  test('rejects a malformed email address', async ({ request }) => {
    // KNOWN DEFECT: the API accepts syntactically invalid email addresses and
    // returns 201. The browser form validates client-side, so this is only
    // reachable via the API — which is exactly why it went unnoticed.
    //
    // test.fail() means "this SHOULD pass but currently doesn't". The run stays
    // green, and the moment the bug is fixed this test errors with "expected to
    // fail but passed", prompting us to remove this line. A defect that can't
    // be silently forgotten.
    test.fail();

    const payload = buildUser({ email: 'not-an-email' });

    const response = await request.post(`${env.apiURL}/users/register`, { data: payload });

    expect(response.status()).toBe(422);
  });

  test('a newly registered user can authenticate', async ({ authApi, newUser }) => {
    const token = await authApi.login(newUser.email, newUser.password);

    expect(token).toBeTruthy();
    // A JWT is three base64 segments separated by dots.
    expect(token.split('.')).toHaveLength(3);
  });
});
