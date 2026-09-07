import { defineConfig, devices } from '@playwright/test';
import { env } from './src/config/env';
import { STORAGE_STATE } from './src/config/paths';

/**
 * Playwright configuration.
 *
 * Reading order for a newcomer:
 *   1. `testDir` / `projects` — WHAT runs and WHERE
 *   2. `use`                  — HOW every test behaves by default
 *   3. `reporter` / `retries` — WHAT you get when things fail
 *
 * Docs: https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  // Where the spec files live. Everything under here is discovered automatically.
  testDir: './tests',

  // Run every test file in parallel, AND tests inside a single file in parallel.
  // This forces us to write independent tests — which is the point.
  // If two tests can't run at the same time, that's a design smell, not a config problem.
  fullyParallel: true,

  // `test.only` left in the code will fail the CI build instead of silently
  // skipping the other 400 tests. This has saved real teams real incidents.
  forbidOnly: env.isCI,

  // Retries hide flakiness, so we allow them ONLY on CI, where a network blip
  // shouldn't block a merge. Locally we want to see the flake and fix it.
  retries: env.isCI ? 2 : 0,

  // CI machines are usually small and shared; local machines are not.
  // `undefined` lets Playwright pick (roughly half your CPU cores).
  ...(env.isCI ? { workers: 2 } : {}),

  // Fail the whole run early if something is systemically broken,
  // instead of burning 30 minutes of CI to report 300 identical failures.
  maxFailures: env.isCI ? 20 : 0,

  // Reporters are additive. `list` for the terminal, `html` for humans,
  // `junit` + `github` for CI systems that parse machine-readable output.
  reporter: env.isCI
    ? [
        ['list'],
        ['html', { open: 'never', outputFolder: 'playwright-report' }],
        ['junit', { outputFile: 'test-results/junit.xml' }],
        ['github'],
      ]
    : [['list'], ['html', { open: 'never' }]],

  // Artifacts (screenshots, videos, traces) land here.
  outputDir: 'test-results',

  // Hard ceiling per test. If a test needs more than 60s, it's doing too much.
  timeout: 60_000,

  expect: {
    // How long a web-first assertion (expect(locator).toBeVisible()) polls
    // before giving up. Keep this SHORT — it's the main lever against slow suites.
    timeout: 10_000,
  },

  /* ---------------------------------------------------------------------
   * Defaults inherited by every test, in every project.
   * ------------------------------------------------------------------- */
  use: {
    // Lets tests call page.goto('/login') instead of hardcoding the host.
    // Change one env var and the whole suite points at a different environment.
    baseURL: env.baseURL,

    // Trace = a full recording of the run (DOM snapshots, network, console).
    // 'on-first-retry' means: no cost on green runs, full forensics on failures.
    // Open with: npx playwright show-trace test-results/.../trace.zip
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',

    // Per-action ceiling (click, fill, ...). Deliberately lower than the test
    // timeout so a single stuck action fails fast with a clear message.
    actionTimeout: 15_000,
    navigationTimeout: 30_000,

    // Ignore HTTPS errors on self-signed staging certs.
    ignoreHTTPSErrors: true,
    // This app instruments its markup with `data-test="..."` attributes.
    // Playwright's default is `data-testid`, so without this line
    // getByTestId would silently find nothing.
    testIdAttribute: 'data-test',

    // Tag every request so the app team can filter automated traffic out of analytics.
    extraHTTPHeaders: {
      'X-Test-Run': 'playwright-e2e',
    },
  },

  /* ---------------------------------------------------------------------
   * Projects. A "project" is a named run configuration.
   * We use them for two different jobs:
   *   (a) cross-browser coverage
   *   (b) setup/teardown phases that other projects depend on
   * ------------------------------------------------------------------- */
  projects: [
    /**
     * The setup project. `testMatch` means it picks up ONLY *.setup.ts files,
     * so it never runs your specs. It has no storageState of its own, which
     * is exactly right — it starts logged out and creates the session.
     */
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
    },

    /**
     * `dependencies: ['setup']` makes Playwright run setup to completion
     * before this project starts. If setup fails, these are skipped rather
     * than run against a stale or missing session file — which turns one
     * clear failure into one clear failure, instead of 300 confusing ones.
     *
     * `storageState` loads the saved session into every new browser context,
     * so each test opens already authenticated.
     */
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: STORAGE_STATE.customer,
      },
      dependencies: ['setup'],
    },
    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
        storageState: STORAGE_STATE.customer,
      },
      dependencies: ['setup'],
    },
    {
      name: 'webkit',
      use: {
        ...devices['Desktop Safari'],
        storageState: STORAGE_STATE.customer,
      },
      dependencies: ['setup'],
    },
    {
      name: 'mobile-chrome',
      use: {
        ...devices['Pixel 7'],
        storageState: STORAGE_STATE.customer,
      },
      dependencies: ['setup'],
    },

    /**
     * A separate project for admin-only tests. Same browser, different
     * session file, and it only picks up specs under tests/admin/.
     * This is how you run one suite as two different users.
     */
    {
      name: 'admin',
      testMatch: /.*\/admin\/.*\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        storageState: STORAGE_STATE.admin,
      },
      dependencies: ['setup'],
    },
  ],
});
