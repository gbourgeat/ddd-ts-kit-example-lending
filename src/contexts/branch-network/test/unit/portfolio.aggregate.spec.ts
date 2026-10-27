import { describe, expect, it } from '@jest/globals';
import { PortfolioOpened } from '@/contexts/branch-network/domain/events/portfolio-opened.event';
import { Portfolio } from '@/contexts/branch-network/domain/aggregates/portfolio.aggregate';
import { aPortfolio } from '@/contexts/branch-network/test/builders/portfolio.builder';

describe('Portfolio', () => {
  it('is born with its identity, its advisor and its branch', () => {
    const bornAt = new Date('2026-03-01T00:00:00.000Z');

    const born = aPortfolio().identifiedBy('portfolio-7').heldBy('staff-7').inBranch('branch-3').bornAt(bornAt).build();

    expect(born.id).toBe('portfolio-7');
    expect(born.advisorId).toBe('staff-7');
    expect(born.branchId).toBe('branch-3');
    expect(born.registeredAt).toEqual(bornAt);
  });

  it('records the fact that it is opened', () => {
    const bornAt = new Date('2026-03-01T00:00:00.000Z');

    const opened = aPortfolio().identifiedBy('portfolio-7').bornAt(bornAt).build();

    expect(opened.pullEvents()).toEqual([new PortfolioOpened('portfolio-7', bornAt)]);
  });

  it('is rehydrated in its stored state without recording a new fact', () => {
    const stored = aPortfolio().build();

    const loaded = Portfolio.rehydrate(stored.id, stored.toState());

    expect(loaded.toState()).toEqual(stored.toState());
    expect(loaded.pullEvents()).toEqual([]);
  });
});
