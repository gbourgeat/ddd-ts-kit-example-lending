import { describe, expect, it } from '@jest/globals';
import { DeclaredConflictRow } from '@/contexts/credit-application/decision/application/projections/declared-conflict-row.projection';

describe('Declared conflict row, as the read model holds it', () => {
  it('keeps the conflict, the staff member who declared it and the customer it is declared on', () => {
    const row = new DeclaredConflictRow('conflict-1', 'staff-1', 'customer-1');

    expect(row).toEqual({ conflictOfInterestId: 'conflict-1', staffMemberId: 'staff-1', customerId: 'customer-1' });
  });
});
