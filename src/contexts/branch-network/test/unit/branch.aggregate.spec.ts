import { describe, expect, it } from '@jest/globals';
import { BranchOpened } from '@/contexts/branch-network/domain/events/branch-opened.event';
import { Branch } from '@/contexts/branch-network/domain/aggregates/branch.aggregate';
import { aBranch } from '@/contexts/branch-network/test/builders/branch.builder';

describe('Branch', () => {
  it('is born with its identity', () => {
    const bornAt = new Date('2026-03-01T00:00:00.000Z');

    const born = aBranch().identifiedBy('branch-7').bornAt(bornAt).build();

    expect(born.id).toBe('branch-7');
    expect(born.registeredAt).toEqual(bornAt);
  });

  it('records the fact that it is opened', () => {
    const bornAt = new Date('2026-03-01T00:00:00.000Z');

    const opened = aBranch().identifiedBy('branch-7').bornAt(bornAt).build();

    expect(opened.pullEvents()).toEqual([new BranchOpened('branch-7', bornAt)]);
  });

  it('is rehydrated in its stored state without recording a new fact', () => {
    const stored = aBranch().build();

    const loaded = Branch.rehydrate(stored.id, stored.toState());

    expect(loaded.toState()).toEqual(stored.toState());
    expect(loaded.pullEvents()).toEqual([]);
  });
});
