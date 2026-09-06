# Toolshop E2E — Playwright Page Object Model Framework

End-to-end test framework for [Practice Software Testing](https://practicesoftwaretesting.com)
(the "Toolshop" app), built with Playwright + TypeScript.

A reference implementation of production-grade test automation: Page Object Model,
API-backed test data, typed fixtures, role-based auth, parallel-safe tests, CI-ready.

---

## The application under test

|                          | URL                                                       |
| ------------------------ | --------------------------------------------------------- |
| App (v5, current)        | https://practicesoftwaretesting.com                       |
| API                      | https://api.practicesoftwaretesting.com                   |
| Swagger / OpenAPI        | https://api.practicesoftwaretesting.com/api/documentation |
| Deliberately buggy build | https://with-bugs.practicesoftwaretesting.com             |
| Source + Docker Compose  | https://github.com/testsmith-io/practice-software-testing |

Seeded accounts (published by the app, not secrets):

| Role       | Email                                 | Password  |
| ---------- | ------------------------------------- | --------- |
| admin      | admin@practicesoftwaretesting.com     | welcome01 |
| customer   | customer@practicesoftwaretesting.com  | welcome01 |
| customer 2 | customer2@practicesoftwaretesting.com | welcome01 |

---

## Quick start

```bash
npm install
npx playwright install --with-deps

cp .env.example .env          # defaults work as-is against the hosted app

npm run test:smoke            # should be green
npm run report
```

Requires **Node 20+**.

---

## Common commands

| Command                 | What it does                                              |
| ----------------------- | --------------------------------------------------------- |
| `npm test`              | Full suite, all browsers, headless                        |
| `npm run test:smoke`    | Only `@smoke` tests — fast pre-flight                     |
| `npm run test:chromium` | Single browser — what you'll use while developing         |
| `npm run test:watch`    | Playwright UI mode (time-travel debugging)                |
| `npm run test:debug`    | Step through with the inspector                           |
| `npm run test:bugs`     | Run the suite against the buggy build — tests SHOULD fail |
| `npm run report`        | Open the last HTML report                                 |
| `npm run codegen`       | Record a flow and get locator suggestions                 |
| `npm run verify`        | Typecheck + lint + format check — run before pushing      |

---

## Project structure

```
src/
  config/       Environment configuration (the ONLY place process.env is read)
  pages/        Page Objects — one per screen
    components/ Shared UI components (header, product card, pagination, filters)
  api/          API clients used for test data setup, auth, and teardown
  fixtures/     Custom Playwright fixtures — dependency injection for tests
  data/         Test data builders and factories
  utils/        Generic helpers
tests/
  smoke/        Fast health checks
  ui/           Feature tests driven through the browser
  api/          Contract and behaviour tests against the REST API
```

### Layer rules

The value of the architecture is in the boundaries, not the folders:

1. **Tests never contain locators.** A CSS selector in a spec file belongs in a Page Object.
2. **Page Objects expose state; tests decide what's correct.** `expect` lives in the test,
   so a failure reads as a violated requirement rather than a broken helper.
3. **Page Objects don't reach into other Page Objects.** Navigation returns the next
   Page Object — that's the only coupling allowed.
4. **Test data is created through the API**, never through the UI, unless creating it
   through the UI is the thing under test.
5. **Every test runs alone, in any order, in parallel.** Shared mutable state is banned.

---

## Environments

`TEST_ENV` in `.env` selects the target: `local` | `v1`–`v5` | `with-bugs`.
URLs live in `src/config/env.ts`. No host is hardcoded anywhere else.

The versioned deployments are genuinely useful:

- Point the suite at `v4` to see which tests fail against an older release.
- Point it at `with-bugs` to prove the suite actually detects regressions.
  A suite that never goes red has never been shown to work.

### Running the app locally

For fully deterministic runs with a resettable database:

```bash
git clone https://github.com/testsmith-io/practice-software-testing
cd practice-software-testing
docker compose up -d          # ~5 min first time, seconds after

# reset to a known state whenever you want
docker exec -it pst-laravel-api-1 php artisan migrate:fresh --seed
```

Then set `TEST_ENV=local` in `.env`. Nothing in the test code changes.

---

## Debugging a failure

1. `npm run report` — read the failure and screenshot.
2. Open the trace: `npx playwright show-trace test-results/<test>/trace.zip`.
   You get DOM snapshots at every step, plus network, console, and source.
3. Reproduce interactively: `npm run test:watch`.

Traces record on first retry only, so green runs stay fast.
