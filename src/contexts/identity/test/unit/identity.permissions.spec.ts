import { describe, expect, it } from '@jest/globals';
import type { Permission } from '@ddd-ts-kit/auth';
import { identityPermissions } from '@/contexts/identity/identity.permissions';

describe('The permissions of identity', () => {
  it('belong to identity, each under an identifier of its own and with a description', () => {
    const permissions: readonly Permission[] = Object.values(identityPermissions);
    const identifiers = permissions.map((permission) => permission.id);

    expect(new Set(identifiers).size).toBe(identifiers.length);
    expect(permissions.filter((permission) => permission.context !== 'identity')).toEqual([]);
    expect(permissions.filter((permission) => permission.description.trim() === '')).toEqual([]);
  });
});
