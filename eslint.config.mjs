import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import playwright from 'eslint-plugin-playwright';

/**
 * Lint rules chosen for one purpose: catch the mistakes that make a
 * Playwright suite slow, flaky, or silently green.
 */
export default tseslint.config(
  { ignores: ['node_modules/', 'playwright-report/', 'test-results/', 'blob-report/'] },

  js.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,

  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // THE most important rule in a Playwright project.
      // A forgotten `await` on an assertion means the test passes no matter what.
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/await-thenable': 'error',
      '@typescript-eslint/require-await': 'error',

      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/explicit-function-return-type': [
        'warn',
        { allowExpressions: true, allowTypedFunctionExpressions: true },
      ],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      eqeqeq: ['error', 'always'],
      'prefer-const': 'error',
    },
  },

  {
    files: ['tests/**/*.spec.ts'],
    ...playwright.configs['flat/recommended'],
    rules: {
      ...playwright.configs['flat/recommended'].rules,

      // Blocks `test.only` from reaching main.
      'playwright/no-focused-test': 'error',

      // Blocks `page.waitForTimeout(3000)`. Arbitrary sleeps are the #1 cause
      // of suites that are both slow AND flaky. Use web-first assertions instead.
      'playwright/no-wait-for-timeout': 'error',

      // Conditional logic in a test means the test doesn't know what it's asserting.
      'playwright/no-conditional-in-test': 'warn',

      // Every test must assert something.
      'playwright/expect-expect': 'error',

      // Skipped tests rot. Warn so they stay visible.
      'playwright/no-skipped-test': 'warn',
    },
  },
);
