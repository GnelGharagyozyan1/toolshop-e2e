import { test as base, request as playwrightRequest } from '@playwright/test';
import { AuthApi } from '@api/auth.api';
import { buildUser } from '@data/user.factory';
import type { TestUser } from '@api/types';
import { env } from '@config/env';

type TestFixtures = {
  authApi: AuthApi;
  newUser: TestUser;
};

type WorkerFixtures = {
  adminToken: string;
};

export const test = base.extend<TestFixtures, WorkerFixtures>({
  adminToken: [
    async ({}, use) => {
      const context = await playwrightRequest.newContext();
      const api = new AuthApi(context);

      const token = await api.login(env.users.admin.email, env.users.admin.password);

      await use(token);

      await context.dispose();
    },
    { scope: 'worker' },
  ],

  authApi: async ({}, use) => {
    const context = await playwrightRequest.newContext();

    await use(new AuthApi(context));

    await context.dispose();
  },

  newUser: async ({ authApi, adminToken }, use) => {
    const payload = buildUser();
    const user = await authApi.register(payload);

    await use(user);

    const deleted = await authApi.deleteUser(user.id, adminToken);
    if (!deleted) {
      console.warn(`Cleanup failed: could not delete user ${user.id} (${user.email})`);
    }
  },
});

export { expect } from '@playwright/test';
