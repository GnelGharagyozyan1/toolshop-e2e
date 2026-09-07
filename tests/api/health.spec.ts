import { test, expect } from '@fixtures/test';
import { env } from '@config/env';

/**
 * API reachability checks.
 *
 * Split out of the UI smoke suite in Phase 6. These need no browser, so they
 * live in the `api` project and run in milliseconds.
 */
test.describe('API health @smoke', () => {
  test('the products endpoint responds', async ({ request }) => {
    const response = await request.get(`${env.apiURL}/products`);

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);
  });

  test('the seeded customer credentials are valid', async ({ request }) => {
    // Fails fast and clearly if .env is misconfigured, instead of letting
    // forty UI tests fail with a confusing "not logged in".
    const response = await request.post(`${env.apiURL}/users/login`, {
      data: {
        email: env.users.customer.email,
        password: env.users.customer.password,
      },
    });

    expect(response.ok()).toBeTruthy();
  });
});
