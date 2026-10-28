import type { ReadPortfolioAtRiskQuery } from '@/contexts/servicing/arrears/application/queries/read-portfolio-at-risk/read-portfolio-at-risk.query';
import type { ReadPortfolioAtRiskResult } from '@/contexts/servicing/arrears/application/queries/read-portfolio-at-risk/read-portfolio-at-risk.result';

export abstract class ReadPortfolioAtRiskReader {
  abstract read(query: ReadPortfolioAtRiskQuery): Promise<ReadPortfolioAtRiskResult>;
}
