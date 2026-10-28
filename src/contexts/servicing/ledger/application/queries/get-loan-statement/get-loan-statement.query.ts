import { AuthorizedQuery, type Actor } from '@ddd-ts-kit/kernel';
import type { GetLoanStatementResult } from '@/contexts/servicing/ledger/application/queries/get-loan-statement/get-loan-statement.result';

/** The statement of a loan on a past date: its balance, its arrears and its schedule, replayed from its events up to that date. */
export class GetLoanStatementQuery extends AuthorizedQuery<GetLoanStatementResult> {
  constructor(
    actor: Actor,
    readonly loanId: string,
    readonly asOf: Date,
  ) {
    super(actor);
  }
}
