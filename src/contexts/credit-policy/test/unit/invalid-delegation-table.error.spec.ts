import { describe, expect, it } from '@jest/globals';
import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { InvalidDelegationTable } from '@/contexts/credit-policy/domain/errors/invalid-delegation-table.error';

describe('InvalidDelegationTable', () => {
  it('refuses a limit that is not a whole amount of cents and exposes the level and the amount', () => {
    const error = InvalidDelegationTable.forLimit('advisor', -5);

    expect(error).toBeInstanceOf(DomainRefusal);
    expect(error.code).toBe('INVALID_DELEGATION_TABLE');
    expect(error.facts).toEqual({ level: 'advisor', amountCents: -5 });
  });

  it('refuses a table that does not give each level once and exposes the levels it gives', () => {
    const error = InvalidDelegationTable.forLevels(['advisor', 'advisor']);

    expect(error.code).toBe('INVALID_DELEGATION_TABLE');
    expect(error.facts).toEqual({ levels: ['advisor', 'advisor'] });
  });
});
