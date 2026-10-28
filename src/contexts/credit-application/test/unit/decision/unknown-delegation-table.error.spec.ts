import { describe, expect, it } from '@jest/globals';
import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { UnknownDelegationTable } from '@/contexts/credit-application/decision/domain/errors/unknown-delegation-table.error';

describe('UnknownDelegationTable', () => {
  it('refuses for unknown delegation table with the code UNKNOWN_DELEGATION_TABLE', () => {
    const error = UnknownDelegationTable.forUnknownDelegationTable();

    expect(error).toBeInstanceOf(DomainRefusal);
    expect(error.code).toBe('UNKNOWN_DELEGATION_TABLE');
    expect(error.message).toBe('Unknown delegation table.');
    expect(error.facts).toEqual({});
  });
});
