import { describe, expect, it } from '@jest/globals';
import type { Permission } from '@ddd-ts-kit/auth';
import { dataProtectionPermissions } from '@/contexts/data-protection/data-protection.permissions';

describe('The permissions of data-protection', () => {
  it('belong to data-protection, each under an identifier of its own and with a description', () => {
    const permissions: readonly Permission[] = Object.values(dataProtectionPermissions);
    const identifiers = permissions.map((permission) => permission.id);

    expect(new Set(identifiers).size).toBe(identifiers.length);
    expect(permissions.filter((permission) => permission.context !== 'data-protection')).toEqual([]);
    expect(permissions.filter((permission) => permission.description.trim() === '')).toEqual([]);
  });
});
