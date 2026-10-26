import { describe, expect, it } from '@jest/globals';
import type { Permission } from '@ddd-ts-kit/auth';
import { creditPolicyPermissions } from '@/contexts/credit-policy/credit-policy.permissions';

describe('The permissions of credit-policy', () => {
  it('belong to credit-policy, each under an identifier of its own and with a description', () => {
    const permissions: readonly Permission[] = Object.values(creditPolicyPermissions);
    const identifiers = permissions.map((permission) => permission.id);

    expect(new Set(identifiers).size).toBe(identifiers.length);
    expect(permissions.filter((permission) => permission.context !== 'credit-policy')).toEqual([]);
    expect(permissions.filter((permission) => permission.description.trim() === '')).toEqual([]);
  });
});
