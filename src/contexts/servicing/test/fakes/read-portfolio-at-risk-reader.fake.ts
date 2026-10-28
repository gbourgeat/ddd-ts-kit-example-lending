import type { ReadPortfolioAtRiskReader } from '@/contexts/servicing/arrears/application/ports/read-portfolio-at-risk-reader.port';
import type { ReadPortfolioAtRiskResult } from '@/contexts/servicing/arrears/application/queries/read-portfolio-at-risk/read-portfolio-at-risk.result';

/** The portfolio at risk answered from a given answer: the reader a handler is tested with. */
export class FakeReadPortfolioAtRiskReader implements ReadPortfolioAtRiskReader {
  constructor(private readonly answer: ReadPortfolioAtRiskResult) {}

  async read(): Promise<ReadPortfolioAtRiskResult> {
    return this.answer;
  }
}
