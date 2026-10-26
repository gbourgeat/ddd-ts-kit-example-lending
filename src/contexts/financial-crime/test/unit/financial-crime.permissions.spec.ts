import { describe, expect, it } from '@jest/globals';
import type { Permission } from '@ddd-ts-kit/auth';
import { financialCrimePermissions } from '@/contexts/financial-crime/financial-crime.permissions';

describe('The permissions of financial-crime', () => {
  it('belong to financial-crime, each under an identifier of its own and with a description', () => {
    const permissions: readonly Permission[] = Object.values(financialCrimePermissions);
    const identifiers = permissions.map((permission) => permission.id);

    expect(new Set(identifiers).size).toBe(identifiers.length);
    expect(permissions.filter((permission) => permission.context !== 'financial-crime')).toEqual([]);
    expect(permissions.filter((permission) => permission.description.trim() === '')).toEqual([]);
  });
});
