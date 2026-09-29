import path from 'node:path';

export const STORAGE_STATE = {
  customer: path.resolve('playwright/.auth/customer.json'),
  admin: path.resolve('playwright/.auth/admin.json'),
} as const;

export type StorageRole = keyof typeof STORAGE_STATE;
