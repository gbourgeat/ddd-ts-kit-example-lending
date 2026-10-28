import { AuthorizedQuery, type Actor } from '@ddd-ts-kit/kernel';
import type { ReadLoanResult } from '@/contexts/servicing/ledger/application/queries/read-loan/read-loan.result';

/** Reads one loan: the borrower who reads its application reads its loan, `loan.read` on the loan. */
export class ReadLoanQuery extends AuthorizedQuery<ReadLoanResult> {
  constructor(
    actor: Actor,
    readonly loanId: string,
  ) {
    super(actor);
  }
}
