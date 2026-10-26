import { describe, expect, it } from '@jest/globals';
import type { Permission } from '@ddd-ts-kit/auth';
import { servicingPermissions } from '@/contexts/servicing/servicing.permissions';

describe('The permissions of servicing', () => {
  it('belong to servicing, each under an identifier of its own and with a description', () => {
    const permissions: readonly Permission[] = Object.values(servicingPermissions);
    const identifiers = permissions.map((permission) => permission.id);

    expect(new Set(identifiers).size).toBe(identifiers.length);
    expect(permissions.filter((permission) => permission.context !== 'servicing')).toEqual([]);
    expect(permissions.filter((permission) => permission.description.trim() === '')).toEqual([]);
  });
});
