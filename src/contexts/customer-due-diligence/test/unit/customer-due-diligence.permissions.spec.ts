import { describe, expect, it } from '@jest/globals';
import type { Permission } from '@ddd-ts-kit/auth';
import { customerDueDiligencePermissions } from '@/contexts/customer-due-diligence/customer-due-diligence.permissions';

describe('The permissions of customer-due-diligence', () => {
  it('belong to customer-due-diligence, each under an identifier of its own and with a description', () => {
    const permissions: readonly Permission[] = Object.values(customerDueDiligencePermissions);
    const identifiers = permissions.map((permission) => permission.id);

    expect(new Set(identifiers).size).toBe(identifiers.length);
    expect(permissions.filter((permission) => permission.context !== 'customer-due-diligence')).toEqual([]);
    expect(permissions.filter((permission) => permission.description.trim() === '')).toEqual([]);
  });
});
