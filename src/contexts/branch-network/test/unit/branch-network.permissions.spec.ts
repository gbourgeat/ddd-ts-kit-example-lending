import { describe, expect, it } from '@jest/globals';
import type { Permission } from '@ddd-ts-kit/auth';
import { branchNetworkPermissions } from '@/contexts/branch-network/branch-network.permissions';

describe('The permissions of branch-network', () => {
  it('belong to branch-network, each under an identifier of its own and with a description', () => {
    const permissions: readonly Permission[] = Object.values(branchNetworkPermissions);
    const identifiers = permissions.map((permission) => permission.id);

    expect(new Set(identifiers).size).toBe(identifiers.length);
    expect(permissions.filter((permission) => permission.context !== 'branch-network')).toEqual([]);
    expect(permissions.filter((permission) => permission.description.trim() === '')).toEqual([]);
  });
});
