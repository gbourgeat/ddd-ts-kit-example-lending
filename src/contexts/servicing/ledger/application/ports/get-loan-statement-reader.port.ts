import type { GetLoanStatementQuery } from '@/contexts/servicing/ledger/application/queries/get-loan-statement/get-loan-statement.query';
import type { GetLoanStatementResult } from '@/contexts/servicing/ledger/application/queries/get-loan-statement/get-loan-statement.result';

export abstract class GetLoanStatementReader {
  abstract read(query: GetLoanStatementQuery): Promise<GetLoanStatementResult>;
}
