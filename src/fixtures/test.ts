import { test as base, request as playwrightRequest } from '@playwright/test';
import { AuthApi } from '@api/auth.api';
import { buildUser } from '@data/user.factory';
import type { TestUser } from '@api/types';
import { env } from '@config/env';

/**
 * Custom fixtures — dependency injection for tests.
 *
 * WHAT A FIXTURE IS
 *
 * A fixture is a named thing your test can ask for by destructuring it out of
 * the test callback. Playwright builds it before the test, hands it over, and
 * tears it down afterwards. You've been using them all along: `page` and
 * `request` are built-in fixtures.
 *
 * WHY THIS BEATS beforeEach
 *
 *   - LAZY. A fixture is only built if a test actually asks for it. A
 *     beforeEach runs for every test in the file whether it's needed or not.
 *   - EXPLICIT. `async ({ newUser }) => {}` states the test's dependencies in
 *     its signature. With beforeEach you have to scroll up to find out what
 *     magically exists.
 *   - TYPED. Autocomplete works, typos are compile errors.
 *   - COMPOSABLE. Fixtures can depend on other fixtures.
 *   - TEARDOWN IS COLOCATED. Setup and cleanup sit in one place instead of
 *     being split across beforeEach and afterEach.
 */

type TestFixtures = {
  authApi: AuthApi;
  newUser: TestUser;
};

export const test = base.extend<TestFixtures>({
  /**
   * A ready-to-use auth API client.
   *
   * It builds its own request context rather than borrowing the browser's,
   * so it works even in tests that never open a page.
   */
  authApi: async ({}, use) => {
    const context = await playwrightRequest.newContext({ baseURL: env.apiURL });

    // Everything BEFORE `use()` is setup.
    await use(new AuthApi(context));
    // Everything AFTER `use()` is teardown — it runs even if the test failed.

    await context.dispose();
  },

  /**
   * A freshly registered user, unique to this test.
   *
   * This is the fixture that solves the shared-state problem. Every test that
   * asks for `newUser` gets its own account, so no two tests can interfere
   * with each other no matter how many workers run in parallel.
   *
   * Cost: roughly 300ms via the API. Creating the same user through the
   * registration form would take 5-8 seconds and could fail for reasons that
   * have nothing to do with what you're testing.
   *
   * ON CLEANUP: we deliberately leave these accounts behind. Deleting them
   * would need admin credentials and an endpoint we haven't verified, and a
   * teardown that fails is worse than no teardown — it turns a passing test
   * red for a reason unrelated to the test. Because every email is unique,
   * leftover accounts can't affect later runs. On a real project you'd either
   * add a verified cleanup step here or reset the database between runs.
   */
  newUser: async ({ authApi }, use) => {
    const payload = buildUser();
    const user = await authApi.register(payload);

    await use(user);
  },
});

/**
 * Re-export `expect` so spec files have a single import.
 * From here on, tests import from '@fixtures/test', not '@playwright/test'.
 */
export { expect } from '@playwright/test';
