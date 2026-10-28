import { AuthorizedQuery } from '@ddd-ts-kit/kernel';
import type { PortfolioAtRiskPerBranchResult } from '@/contexts/reporting/application/queries/portfolio-at-risk-per-branch/portfolio-at-risk-per-branch.result';

/** The portfolio at risk of every branch of the tenant: the report is the context itself, on no element, so the permission alone gates it. */
export class PortfolioAtRiskPerBranchQuery extends AuthorizedQuery<PortfolioAtRiskPerBranchResult> {}
