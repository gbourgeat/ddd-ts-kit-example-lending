import { describe, expect, it } from '@jest/globals';
import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { ConflictOnOwnRecord } from '@/contexts/branch-network/domain/errors/conflict-on-own-record.error';

describe('ConflictOnOwnRecord', () => {
  it('refuses a declaration on the own customer file of the staff member, with the code CONFLICT_ON_OWN_RECORD', () => {
    const error = ConflictOnOwnRecord.forCustomer('customer-1');

    expect(error).toBeInstanceOf(DomainRefusal);
    expect(error.code).toBe('CONFLICT_ON_OWN_RECORD');
    expect(error.facts).toEqual({ customerId: 'customer-1' });
  });
});
