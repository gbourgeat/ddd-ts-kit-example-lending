import type { ReadLoanQuery } from '@/contexts/servicing/ledger/application/queries/read-loan/read-loan.query';
import type { ReadLoanResult } from '@/contexts/servicing/ledger/application/queries/read-loan/read-loan.result';

export abstract class ReadLoanReader {
  abstract read(query: ReadLoanQuery): Promise<ReadLoanResult>;
}
