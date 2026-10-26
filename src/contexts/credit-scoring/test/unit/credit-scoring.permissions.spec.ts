import { describe, expect, it } from '@jest/globals';
import type { Permission } from '@ddd-ts-kit/auth';
import { creditScoringPermissions } from '@/contexts/credit-scoring/credit-scoring.permissions';

describe('The permissions of credit-scoring', () => {
  it('belong to credit-scoring, each under an identifier of its own and with a description', () => {
    const permissions: readonly Permission[] = Object.values(creditScoringPermissions);
    const identifiers = permissions.map((permission) => permission.id);

    expect(new Set(identifiers).size).toBe(identifiers.length);
    expect(permissions.filter((permission) => permission.context !== 'credit-scoring')).toEqual([]);
    expect(permissions.filter((permission) => permission.description.trim() === '')).toEqual([]);
  });
});
