import { describe, expect, it } from '@jest/globals';
import { PortfolioOpened } from '@/contexts/branch-network/domain/events/portfolio-opened.event';

describe('PortfolioOpened', () => {
  it('is named after the context, the aggregate and the fact', () => {
    const event = new PortfolioOpened('portfolio-1', new Date('2026-01-01T00:00:00.000Z'));

    expect(event.name).toBe('branch-network.portfolio.opened');
    expect(event.aggregateId).toBe('portfolio-1');
  });
});
