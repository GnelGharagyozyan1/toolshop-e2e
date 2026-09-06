import { config as loadDotenv } from 'dotenv';

/**
 * Single source of truth for environment configuration.
 *
 * Rule: `process.env` is read HERE and nowhere else in the codebase.
 * Everything downstream imports a typed, validated `env` object.
 *
 * Why this matters:
 *   - a typo in process.env.BASE_URL silently gives you `undefined`
 *   - scattered process.env reads make it impossible to see what a run needs
 *   - failing fast at startup beats a confusing timeout 40 tests later
 */

// .env holds LOCAL overrides and secrets only. It is gitignored.
// On CI, values come from the CI provider's secret store instead.
loadDotenv({ quiet: true });

/**
 * The application under test publishes several deployed versions.
 *
 *   v1..v4      snapshots of earlier development sprints
 *   v5          current release  (default)
 *   with-bugs   v5 with defects deliberately injected
 *   local       your own Docker Compose instance
 *
 * Being able to point the same suite at `with-bugs` and watch it go red is
 * the cheapest possible proof that your tests actually detect regressions.
 */
export type TargetEnvironment = 'local' | 'v1' | 'v2' | 'v3' | 'v4' | 'v5' | 'with-bugs';

const TARGETS: Record<TargetEnvironment, { web: string; api: string }> = {
  local: {
    web: 'http://localhost:4200',
    api: 'http://localhost:8091',
  },
  v1: {
    web: 'https://v1.practicesoftwaretesting.com',
    api: 'https://api-v1.practicesoftwaretesting.com',
  },
  v2: {
    web: 'https://v2.practicesoftwaretesting.com',
    api: 'https://api-v2.practicesoftwaretesting.com',
  },
  v3: {
    web: 'https://v3.practicesoftwaretesting.com',
    api: 'https://api-v3.practicesoftwaretesting.com',
  },
  v4: {
    web: 'https://v4.practicesoftwaretesting.com',
    api: 'https://api-v4.practicesoftwaretesting.com',
  },
  v5: {
    web: 'https://practicesoftwaretesting.com',
    api: 'https://api.practicesoftwaretesting.com',
  },
  'with-bugs': {
    web: 'https://with-bugs.practicesoftwaretesting.com',
    api: 'https://api-with-bugs.practicesoftwaretesting.com',
  },
};

function optional(name: string, fallback: string): string {
  const value = process.env[name];
  return value === undefined || value === '' ? fallback : value;
}

/** Read a variable that must be present, failing loudly at startup if it isn't. */
function requiredVar(name: string, fallback?: string): string {
  const value = optional(name, fallback ?? '');
  if (value === '') {
    throw new Error(
      `Missing required environment variable: ${name}. Copy .env.example to .env and fill it in.`,
    );
  }
  return value;
}

const rawTarget = optional('TEST_ENV', 'v5');
if (!(rawTarget in TARGETS)) {
  throw new Error(
    `Unknown TEST_ENV "${rawTarget}". Expected one of: ${Object.keys(TARGETS).join(', ')}`,
  );
}
const target = rawTarget as TargetEnvironment;
const selected = TARGETS[target];

export const env = {
  /** Which deployed version this run targets. */
  name: target,

  /** Base URL for UI navigation. Consumed by playwright.config `use.baseURL`. */
  baseURL: optional('BASE_URL', selected.web),

  /** Base URL for direct API calls: auth, test-data setup, cleanup. */
  apiURL: optional('API_URL', selected.api),

  /** True inside any CI system. */
  isCI: Boolean(process.env['CI']),

  /**
   * Seeded accounts shipped with the application.
   *
   * These are safe for READ-ONLY tests and for flows that create data scoped
   * to the user (carts, favourites, orders). Any test that mutates shared
   * state — editing a product, deleting a brand — creates its own throwaway
   * user through the API instead. We build that in Phase 4.
   */
  users: {
    admin: {
      email: requiredVar('ADMIN_EMAIL', 'admin@practicesoftwaretesting.com'),
      password: requiredVar('ADMIN_PASSWORD', 'welcome01'),
    },
    customer: {
      email: requiredVar('CUSTOMER_EMAIL', 'customer@practicesoftwaretesting.com'),
      password: requiredVar('CUSTOMER_PASSWORD', 'welcome01'),
    },
  },
} as const;

export type Env = typeof env;
export type UserRole = keyof typeof env.users;
