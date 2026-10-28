import type { QueryHandler } from '@ddd-ts-kit/kernel';
import type { ReadPortfolioAtRiskReader } from '@/contexts/servicing/arrears/application/ports/read-portfolio-at-risk-reader.port';
import type { ReadPortfolioAtRiskQuery } from '@/contexts/servicing/arrears/application/queries/read-portfolio-at-risk/read-portfolio-at-risk.query';
import type { ReadPortfolioAtRiskResult } from '@/contexts/servicing/arrears/application/queries/read-portfolio-at-risk/read-portfolio-at-risk.result';

/** Reads the portfolio at risk through its reader; the context-wide permission is held by the authorization, the tenant bounds the read. */
export class ReadPortfolioAtRiskHandler implements QueryHandler<ReadPortfolioAtRiskQuery> {
  constructor(private readonly reader: ReadPortfolioAtRiskReader) {}

  async execute(query: ReadPortfolioAtRiskQuery): Promise<ReadPortfolioAtRiskResult> {
    return this.reader.read(query);
  }
}
