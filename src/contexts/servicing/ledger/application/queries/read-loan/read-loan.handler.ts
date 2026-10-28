import type { QueryHandler } from '@ddd-ts-kit/kernel';
import type { ReadLoanReader } from '@/contexts/servicing/ledger/application/ports/read-loan-reader.port';
import type { ReadLoanQuery } from '@/contexts/servicing/ledger/application/queries/read-loan/read-loan.query';
import type { ReadLoanResult } from '@/contexts/servicing/ledger/application/queries/read-loan/read-loan.result';

/** Reads one loan through its reader; the authorization of the query already holds `loan.read` on that loan. */
export class ReadLoanHandler implements QueryHandler<ReadLoanQuery> {
  constructor(private readonly reader: ReadLoanReader) {}

  async execute(query: ReadLoanQuery): Promise<ReadLoanResult> {
    return this.reader.read(query);
  }
}
