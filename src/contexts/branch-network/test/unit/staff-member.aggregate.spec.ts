import { describe, expect, it } from '@jest/globals';
import { StaffMemberAppointed } from '@/contexts/branch-network/domain/events/staff-member-appointed.event';
import { StaffMember } from '@/contexts/branch-network/domain/aggregates/staff-member.aggregate';
import { aStaffMember } from '@/contexts/branch-network/test/builders/staff-member.builder';

describe('StaffMember', () => {
  it('is born with its identity and the person it names', () => {
    const bornAt = new Date('2026-03-01T00:00:00.000Z');

    const born = aStaffMember()
      .identifiedBy('staff-7')
      .named('Grace Hopper')
      .reachableAt('grace@bank.test')
      .bornAt(bornAt)
      .build();

    expect(born.id).toBe('staff-7');
    expect(born.name).toBe('Grace Hopper');
    expect(born.email).toBe('grace@bank.test');
    expect(born.registeredAt).toEqual(bornAt);
  });

  it('records the fact that it is appointed', () => {
    const bornAt = new Date('2026-03-01T00:00:00.000Z');

    const appointed = aStaffMember().identifiedBy('staff-7').bornAt(bornAt).build();

    expect(appointed.pullEvents()).toEqual([new StaffMemberAppointed('staff-7', bornAt)]);
  });

  it('is rehydrated in its stored state without recording a new fact', () => {
    const stored = aStaffMember().build();

    const loaded = StaffMember.rehydrate(stored.id, stored.toState());

    expect(loaded.toState()).toEqual(stored.toState());
    expect(loaded.pullEvents()).toEqual([]);
  });
});
