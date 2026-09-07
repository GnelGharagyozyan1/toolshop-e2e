import path from 'node:path';

/**
 * Where authenticated browser sessions are cached.
 *
 * These files contain real session tokens, so they are gitignored
 * (`/playwright/.auth/` is already in .gitignore). Never commit them.
 *
 * One file per role. Storing them separately is what lets a test say
 * "run this as an admin" by pointing at a different file.
 */
export const STORAGE_STATE = {
  customer: path.resolve('playwright/.auth/customer.json'),
  admin: path.resolve('playwright/.auth/admin.json'),
} as const;

export type StorageRole = keyof typeof STORAGE_STATE;
