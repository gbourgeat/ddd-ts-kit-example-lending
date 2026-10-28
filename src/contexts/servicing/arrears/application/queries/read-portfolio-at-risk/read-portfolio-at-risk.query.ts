import { AuthorizedQuery } from '@ddd-ts-kit/kernel';
import type { ReadPortfolioAtRiskResult } from '@/contexts/servicing/arrears/application/queries/read-portfolio-at-risk/read-portfolio-at-risk.result';

/** Reads the portfolio at risk of the tenant: the open loans per arrears bucket and the share 31 days past due and over. `loan.read-portfolio` on the context. */
export class ReadPortfolioAtRiskQuery extends AuthorizedQuery<ReadPortfolioAtRiskResult> {}
