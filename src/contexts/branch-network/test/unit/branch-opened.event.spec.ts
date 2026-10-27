import { describe, expect, it } from '@jest/globals';
import { BranchOpened } from '@/contexts/branch-network/domain/events/branch-opened.event';

describe('BranchOpened', () => {
  it('is named after the context, the aggregate and the fact', () => {
    const event = new BranchOpened('branch-1', new Date('2026-01-01T00:00:00.000Z'));

    expect(event.name).toBe('branch-network.branch.opened');
    expect(event.aggregateId).toBe('branch-1');
  });
});
