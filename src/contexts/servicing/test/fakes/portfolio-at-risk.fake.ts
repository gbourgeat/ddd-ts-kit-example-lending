import { InMemoryReadModelStore } from '@ddd-ts-kit/kernel';
import type { PortfolioAtRisk } from '@/contexts/servicing/arrears/application/ports/portfolio-at-risk.port';
import { portfolioAtRiskCriteria } from '@/contexts/servicing/arrears/application/read-model/portfolio-at-risk.criteria';
import type { PortfolioAtRiskRow } from '@/contexts/servicing/arrears/application/read-model/portfolio-at-risk.row';

/** The portfolio at risk in memory: the reference semantics of its criteria, and of the stamps. */
export class FakePortfolioAtRisk extends InMemoryReadModelStore<PortfolioAtRiskRow> implements PortfolioAtRisk {
  constructor() {
    super(portfolioAtRiskCriteria);
  }
}
