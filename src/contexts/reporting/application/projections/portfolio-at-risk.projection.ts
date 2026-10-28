import { stampOf, type ReadModelWrite } from '@ddd-ts-kit/kernel';
import type { LoanArrearsBucketEnteredV1 } from '@/contexts/servicing/published-language';
import type { PortfolioAtRisk } from '@/contexts/reporting/application/ports/portfolio-at-risk.port';

/** Keeps the arrears bucket of each loan from what servicing announces: a loan counts in the latest bucket it entered. */
export class PortfolioAtRiskProjection {
  constructor(private readonly loans: PortfolioAtRisk) {}

  async arrearsBucketEntered(event: LoanArrearsBucketEnteredV1): Promise<ReadModelWrite> {
    const { loanId, bucket } = event.payload;
    const tenantId = event.tenantId ?? '';
    const key = `${tenantId}:${loanId}`;

    return this.loans.upsertIfNewer(key, stampOf(event), () => ({ key, tenantId, loanId, bucket }));
  }
}
