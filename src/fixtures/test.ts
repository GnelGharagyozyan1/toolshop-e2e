import { test as base, request as playwrightRequest } from '@playwright/test';
import { AuthApi } from '@api/auth.api';
import { buildUser } from '@data/user.factory';
import type { TestUser } from '@api/types';
import { env } from '@config/env';

/**
 * Custom fixtures — dependency injection for tests.
 *
 * A fixture is a named thing a test asks for by destructuring it out of the
 * test callback. Playwright builds it before the test and tears it down after.
 * `page` and `request` are built-in fixtures; these are ours.
 *
 * Why fixtures beat beforeEach: they're lazy (built only if requested),
 * explicit (visible in the test signature), typed, composable, and setup and
 * teardown live in one function instead of two hooks.
 */

/** Fixtures rebuilt for every test. */
type TestFixtures = {
  authApi: AuthApi;
  newUser: TestUser;
};

/** Fixtures built ONCE per worker process and shared by its tests. */
type WorkerFixtures = {
  adminToken: string;
};

export const test = base.extend<TestFixtures, WorkerFixtures>({
  /**
   * An admin bearer token, WORKER-SCOPED.
   *
   * SCOPE IS THE INTERESTING PART HERE.
   *
   * Default fixture scope is 'test' — rebuilt for every single test. An admin
   * token doesn't need that. It's the same token for the whole run, and
   * fetching it per test would add a login round-trip to every test that
   * creates a user.
   *
   * 'worker' scope means it's built once per worker process and reused by
   * every test that worker runs. With 5 workers and 60 tests, that's 5 logins
   * instead of 60.
   *
   * The tuple syntax `[fn, { scope: 'worker' }]` is how you declare it —
   * easy to miss, and forgetting it silently gives you test scope.
   *
   * Rule of thumb: worker scope for anything expensive AND immutable. Never
   * for anything a test might modify, or you've reintroduced shared state.
   */
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

  /**
   * A ready-to-use auth API client.
   *
   * Builds its own request context rather than borrowing the browser's, so it
   * works in tests that never open a page.
   */
  authApi: async ({}, use) => {
    const context = await playwrightRequest.newContext();

    // Everything BEFORE use() is setup.
    await use(new AuthApi(context));
    // Everything AFTER use() is teardown — it runs even if the test failed.

    await context.dispose();
  },

  /**
   * A freshly registered user, unique to this test, deleted afterwards.
   *
   * This fixture solves the shared-state problem: every test that asks for
   * `newUser` gets its own account, so no two tests can collide no matter how
   * many workers run in parallel. Creating it via API costs ~300ms; the same
   * thing through the registration form costs 5-8 seconds and can fail for
   * reasons unrelated to the test.
   *
   * ON TEARDOWN FAILURES — the important design decision here.
   *
   * `deleteUser` returns a boolean instead of throwing, and we only warn when
   * it fails. That's deliberate. If teardown throws, Playwright marks the test
   * as failed — so a cleanup problem would turn a genuinely passing test red,
   * and you'd spend an hour debugging the wrong thing. Cleanup is the most
   * common source of spurious failures in suites that have it.
   *
   * The cost of this choice is real: silent cleanup failures accumulate
   * unnoticed. The console warning is the mitigation, and it's a weak one.
   * On a project you control, the better answer is resetting the database
   * between runs — this app ships `php artisan migrate:fresh --seed` for
   * exactly that. Deletion is the right compromise against a shared instance.
   */
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
