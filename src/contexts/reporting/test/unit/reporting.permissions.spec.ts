import { describe, expect, it } from '@jest/globals';
import type { Permission } from '@ddd-ts-kit/auth';
import { reportingPermissions } from '@/contexts/reporting/reporting.permissions';

describe('The permissions of reporting', () => {
  it('belong to reporting, each under an identifier of its own and with a description', () => {
    const permissions: readonly Permission[] = Object.values(reportingPermissions);
    const identifiers = permissions.map((permission) => permission.id);

    expect(new Set(identifiers).size).toBe(identifiers.length);
    expect(permissions.filter((permission) => permission.context !== 'reporting')).toEqual([]);
    expect(permissions.filter((permission) => permission.description.trim() === '')).toEqual([]);
  });
});
