import { describe, expect, it } from '@jest/globals';
import { ConflictOfInterestDeclared } from '@/contexts/branch-network/domain/events/conflict-of-interest-declared.event';

describe('ConflictOfInterestDeclared', () => {
  it('is named after the context, the aggregate and the fact', () => {
    const event = new ConflictOfInterestDeclared(
      'conflict-of-interest-1',
      'staff-member-1',
      'customer-1',
      new Date('2026-01-01T00:00:00.000Z'),
    );

    expect(event.name).toBe('branch-network.conflict-of-interest.declared');
    expect(event.aggregateId).toBe('conflict-of-interest-1');
    expect(event.staffMemberId).toBe('staff-member-1');
    expect(event.customerId).toBe('customer-1');
  });
});
