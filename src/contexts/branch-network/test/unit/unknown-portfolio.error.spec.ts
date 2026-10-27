import { describe, expect, it } from '@jest/globals';
import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { UnknownPortfolio } from '@/contexts/branch-network/domain/errors/unknown-portfolio.error';

describe('UnknownPortfolio', () => {
  it('refuses for advisor with the code UNKNOWN_PORTFOLIO', () => {
    const error = UnknownPortfolio.forAdvisor('staff-member-1');

    expect(error).toBeInstanceOf(DomainRefusal);
    expect(error.code).toBe('UNKNOWN_PORTFOLIO');
    expect(error.message).toBe('No portfolio of the branch network is held by this advisor.');
    expect(error.facts).toEqual({ advisorId: 'staff-member-1' });
  });

  it('refuses for a portfolio identifier with the same code, and names the identifier', () => {
    const error = UnknownPortfolio.forPortfolio('portfolio-1');

    expect(error).toBeInstanceOf(DomainRefusal);
    expect(error.code).toBe('UNKNOWN_PORTFOLIO');
    expect(error.message).toBe('No portfolio of the branch network has this identifier.');
    expect(error.facts).toEqual({ portfolioId: 'portfolio-1' });
  });
});
