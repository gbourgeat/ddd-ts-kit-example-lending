import { defineCriteria } from '@ddd-ts-kit/kernel';
import type { PortfolioAtRiskRow } from '@/contexts/servicing/arrears/application/read-model/portfolio-at-risk.row';

/** What a read of the portfolio-at-risk read model may filter and sort by. */
export const portfolioAtRiskCriteria = defineCriteria<PortfolioAtRiskRow>({
  fields: {
    loanId: { type: 'string', filter: ['eq'] },
    bucket: { type: 'string', filter: ['eq', 'in'] },
    open: { type: 'boolean', filter: ['eq'] },
  },
  tieBreaker: 'loanId',
});
