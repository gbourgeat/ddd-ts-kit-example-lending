import { defineCriteria } from '@ddd-ts-kit/kernel';
import type { PortfolioAtRiskRow } from '@/contexts/reporting/application/read-model/portfolio-at-risk.row';

/** What a read of the portfolio-at-risk read model may filter and sort by. */
export const portfolioAtRiskCriteria = defineCriteria<PortfolioAtRiskRow>({
  fields: {
    key: { type: 'string', filter: ['eq'] },
    tenantId: { type: 'string', filter: ['eq'] },
    loanId: { type: 'string', filter: ['eq', 'in'] },
    bucket: { type: 'string', filter: ['eq', 'in'] },
  },
  tieBreaker: 'key',
});
