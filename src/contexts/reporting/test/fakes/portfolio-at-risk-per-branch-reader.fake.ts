import type { PortfolioAtRiskPerBranchReader } from '@/contexts/reporting/application/ports/portfolio-at-risk-per-branch-reader.port';
import type { PortfolioAtRiskPerBranchResult } from '@/contexts/reporting/application/queries/portfolio-at-risk-per-branch/portfolio-at-risk-per-branch.result';

/** The portfolio at risk per branch, answered as it was given: the reference of what the reader returns. */
export class FakePortfolioAtRiskPerBranchReader implements PortfolioAtRiskPerBranchReader {
  constructor(private readonly answer: PortfolioAtRiskPerBranchResult) {}

  async read(): Promise<PortfolioAtRiskPerBranchResult> {
    return this.answer;
  }
}
