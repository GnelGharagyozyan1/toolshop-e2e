import { test, expect } from '@fixtures/test';
import { env } from '@config/env';

test.describe('API health @smoke', () => {
  test('the products endpoint responds', async ({ request }) => {
    const response = await request.get(`${env.apiURL}/products`);

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);
  });

  test('the seeded customer credentials are valid', async ({ request }) => {
    const response = await request.post(`${env.apiURL}/users/login`, {
      data: {
        email: env.users.customer.email,
        password: env.users.customer.password,
      },
    });

    expect(response.ok()).toBeTruthy();
  });
});
