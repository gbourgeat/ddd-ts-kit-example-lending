import { describe, expect, it } from '@jest/globals';
import { ConflictOfInterestDeclared } from '@/contexts/branch-network/domain/events/conflict-of-interest-declared.event';
import { ConflictOfInterest } from '@/contexts/branch-network/domain/aggregates/conflict-of-interest.aggregate';
import { aConflictOfInterest } from '@/contexts/branch-network/test/builders/conflict-of-interest.builder';

describe('ConflictOfInterest', () => {
  it('is born with the staff member who declared it and the customer it is about', () => {
    const bornAt = new Date('2026-03-01T00:00:00.000Z');

    const born = aConflictOfInterest()
      .identifiedBy('conflict-7')
      .declaredBy('staff-7')
      .about('customer-9')
      .bornAt(bornAt)
      .build();

    expect(born.id).toBe('conflict-7');
    expect(born.staffMemberId).toBe('staff-7');
    expect(born.customerId).toBe('customer-9');
    expect(born.registeredAt).toEqual(bornAt);
  });

  it('records the fact that it is declared', () => {
    const bornAt = new Date('2026-03-01T00:00:00.000Z');

    const declared = aConflictOfInterest().identifiedBy('conflict-7').bornAt(bornAt).build();

    expect(declared.pullEvents()).toEqual([new ConflictOfInterestDeclared('conflict-7', bornAt)]);
  });

  it('is rehydrated in its stored state without recording a new fact', () => {
    const stored = aConflictOfInterest().build();

    const loaded = ConflictOfInterest.rehydrate(stored.id, stored.toState());

    expect(loaded.toState()).toEqual(stored.toState());
    expect(loaded.pullEvents()).toEqual([]);
  });
});

describe('aConflictOfInterest exposes what it holds', () => {
  it('gives back each fact the aggregate was born with', () => {
    const built = aConflictOfInterest().build();

    expect(built.staffMemberId).toEqual('staff-member-1');
    expect(built.customerId).toEqual('customer-1');
  });
});
