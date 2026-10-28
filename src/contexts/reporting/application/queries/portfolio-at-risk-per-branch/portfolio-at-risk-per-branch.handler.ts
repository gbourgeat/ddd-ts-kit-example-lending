import type { QueryHandler } from '@ddd-ts-kit/kernel';
import type { PortfolioAtRiskPerBranchReader } from '@/contexts/reporting/application/ports/portfolio-at-risk-per-branch-reader.port';
import type { PortfolioAtRiskPerBranchQuery } from '@/contexts/reporting/application/queries/portfolio-at-risk-per-branch/portfolio-at-risk-per-branch.query';
import type { PortfolioAtRiskPerBranchResult } from '@/contexts/reporting/application/queries/portfolio-at-risk-per-branch/portfolio-at-risk-per-branch.result';

export class PortfolioAtRiskPerBranchHandler implements QueryHandler<PortfolioAtRiskPerBranchQuery> {
  constructor(private readonly reader: PortfolioAtRiskPerBranchReader) {}

  async execute(_query: PortfolioAtRiskPerBranchQuery): Promise<PortfolioAtRiskPerBranchResult> {
    return this.reader.read();
  }
}
