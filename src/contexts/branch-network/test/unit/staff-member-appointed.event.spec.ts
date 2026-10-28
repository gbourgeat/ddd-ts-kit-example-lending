import { describe, expect, it } from '@jest/globals';
import { StaffMemberAppointed } from '@/contexts/branch-network/domain/events/staff-member-appointed.event';

describe('StaffMemberAppointed', () => {
  it('is named after the context, the aggregate and the fact, with the branch and the level', () => {
    const event = new StaffMemberAppointed('staff-member-1', new Date('2026-01-01T00:00:00.000Z'), {
      branchId: 'branch-1',
      level: 'advisor',
      accountId: 'account-1',
    });

    expect(event.name).toBe('branch-network.staff-member.appointed');
    expect(event.aggregateId).toBe('staff-member-1');
    expect(event.facts).toEqual({ branchId: 'branch-1', level: 'advisor', accountId: 'account-1' });
  });
});
