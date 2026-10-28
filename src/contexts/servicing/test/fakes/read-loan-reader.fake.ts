import type { ReadLoanReader } from '@/contexts/servicing/ledger/application/ports/read-loan-reader.port';
import type { ReadLoanResult } from '@/contexts/servicing/ledger/application/queries/read-loan/read-loan.result';

/** Answers the loan the spec gives it, whatever the query asks: the reader of the port, in memory. */
export class FakeReadLoanReader implements ReadLoanReader {
  constructor(private readonly answer: ReadLoanResult) {}

  async read(): Promise<ReadLoanResult> {
    return this.answer;
  }
}
