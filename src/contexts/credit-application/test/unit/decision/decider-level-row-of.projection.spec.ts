import { describe, expect, it } from '@jest/globals';
import { staffMemberAppointedV2 } from '@/contexts/branch-network/published-language';
import { deciderLevelRowOf } from '@/contexts/credit-application/decision/application/projections/decider-level-row-of.projection';

describe('Decider level row, read from what branch-network announces', () => {
  it('keeps the staff member, the branch and the level of the appointment', () => {
    const event = staffMemberAppointedV2.create(
      { staffMemberId: 'staff-member-1', branchId: 'branch-1', level: 'level-2' },
      { id: 'event-1', occurredAt: '2026-01-01T00:00:00.000Z' },
    );

    expect(deciderLevelRowOf(event.payload)).toEqual({
      staffMemberId: 'staff-member-1',
      branchId: 'branch-1',
      level: 'level-2',
    });
  });
});
