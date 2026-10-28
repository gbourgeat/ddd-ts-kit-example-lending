import { InMemoryReadModelStore } from '@ddd-ts-kit/kernel';
import type { PortfolioAtRisk } from '@/contexts/reporting/application/ports/portfolio-at-risk.port';
import { portfolioAtRiskCriteria } from '@/contexts/reporting/application/read-model/portfolio-at-risk.criteria';
import type { PortfolioAtRiskRow } from '@/contexts/reporting/application/read-model/portfolio-at-risk.row';

/** The arrears bucket of each loan in memory: the reference semantics of its criteria, and of the stamps. */
export class FakePortfolioAtRisk extends InMemoryReadModelStore<PortfolioAtRiskRow> implements PortfolioAtRisk {
  constructor() {
    super(portfolioAtRiskCriteria);
  }
}
