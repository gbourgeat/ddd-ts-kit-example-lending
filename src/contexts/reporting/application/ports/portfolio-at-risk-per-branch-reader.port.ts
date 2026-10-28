import type { PortfolioAtRiskPerBranchResult } from '@/contexts/reporting/application/queries/portfolio-at-risk-per-branch/portfolio-at-risk-per-branch.result';

/** The portfolio at risk of each branch of the tenant, read from the arrears and the payouts the projections kept. */
export abstract class PortfolioAtRiskPerBranchReader {
  abstract read(): Promise<PortfolioAtRiskPerBranchResult>;
}
