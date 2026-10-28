import type { QueryHandler } from '@ddd-ts-kit/kernel';
import type { GetLoanStatementReader } from '@/contexts/servicing/ledger/application/ports/get-loan-statement-reader.port';
import type { GetLoanStatementQuery } from '@/contexts/servicing/ledger/application/queries/get-loan-statement/get-loan-statement.query';
import type { GetLoanStatementResult } from '@/contexts/servicing/ledger/application/queries/get-loan-statement/get-loan-statement.result';

/** Reads the statement of a loan on a date through its reader; the authorization of the query already holds `loan.read` on that loan. */
export class GetLoanStatementHandler implements QueryHandler<GetLoanStatementQuery> {
  constructor(private readonly reader: GetLoanStatementReader) {}

  async execute(query: GetLoanStatementQuery): Promise<GetLoanStatementResult> {
    return this.reader.read(query);
  }
}
