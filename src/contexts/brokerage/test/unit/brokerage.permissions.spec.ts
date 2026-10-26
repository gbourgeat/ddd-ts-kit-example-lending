import { describe, expect, it } from '@jest/globals';
import type { Permission } from '@ddd-ts-kit/auth';
import { brokeragePermissions } from '@/contexts/brokerage/brokerage.permissions';

describe('The permissions of brokerage', () => {
  it('belong to brokerage, each under an identifier of its own and with a description', () => {
    const permissions: readonly Permission[] = Object.values(brokeragePermissions);
    const identifiers = permissions.map((permission) => permission.id);

    expect(new Set(identifiers).size).toBe(identifiers.length);
    expect(permissions.filter((permission) => permission.context !== 'brokerage')).toEqual([]);
    expect(permissions.filter((permission) => permission.description.trim() === '')).toEqual([]);
  });
});
