import type { GetLoanStatementReader } from '@/contexts/servicing/ledger/application/ports/get-loan-statement-reader.port';
import type { GetLoanStatementQuery } from '@/contexts/servicing/ledger/application/queries/get-loan-statement/get-loan-statement.query';
import type { GetLoanStatementResult } from '@/contexts/servicing/ledger/application/queries/get-loan-statement/get-loan-statement.result';
import type { LoanRepository } from '@/contexts/servicing/ledger/domain/repositories/loan.repository';
import { LoanStatementService } from '@/contexts/servicing/ledger/domain/services/loan-statement.service';
import type { LoanStatement } from '@/contexts/servicing/ledger/domain/values/loan-statement';

/** Replays the statement of the query from the events of the loan stream up to the date: nothing is read from a stored balance. */
export class EventStoreGetLoanStatementReader implements GetLoanStatementReader {
  constructor(private readonly loans: LoanRepository) {}

  async read(query: GetLoanStatementQuery): Promise<GetLoanStatementResult> {
    const history = await this.loans.historyOf(query.loanId);
    const statement = new LoanStatementService().of(query.loanId, history, query.asOf);

    return toResult(statement);
  }
}

function toResult(statement: LoanStatement): GetLoanStatementResult {
  return {
    loanId: statement.loanId,
    asOf: statement.asOf.toISOString(),
    outstandingCapitalCents: statement.outstandingCapital.cents,
    arrearsCents: statement.arrears.cents,
    daysPastDue: statement.daysPastDue,
    instalmentsCents: statement.instalments.map((instalment) => instalment.cents),
    instalmentsDue: [...statement.instalmentsDue],
    instalmentsPaid: [...statement.instalmentsPaid],
    instalmentsUnpaid: [...statement.instalmentsUnpaid],
  };
}
