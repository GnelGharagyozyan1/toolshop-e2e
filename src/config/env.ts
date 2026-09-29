import { config as loadDotenv } from 'dotenv';

loadDotenv({ quiet: true });

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
  name: target,

  baseURL: optional('BASE_URL', selected.web),

  apiURL: optional('API_URL', selected.api),

  isCI: Boolean(process.env['CI']),

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
