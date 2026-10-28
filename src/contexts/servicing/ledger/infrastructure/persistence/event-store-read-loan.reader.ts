import type { ReadLoanReader } from '@/contexts/servicing/ledger/application/ports/read-loan-reader.port';
import type { ReadLoanQuery } from '@/contexts/servicing/ledger/application/queries/read-loan/read-loan.query';
import type { ReadLoanResult } from '@/contexts/servicing/ledger/application/queries/read-loan/read-loan.result';
import type { LoanRepository } from '@/contexts/servicing/ledger/domain/repositories/loan.repository';
import { UnknownLoan } from '@/contexts/servicing/ledger/domain/errors/unknown-loan.error';

/** Reads the loan of the query from its stream: the instalments are the ones the ledger recorded at the payout. */
export class EventStoreReadLoanReader implements ReadLoanReader {
  constructor(private readonly loans: LoanRepository) {}

  async read(query: ReadLoanQuery): Promise<ReadLoanResult> {
    const loan = await this.loans.findById(query.loanId);

    if (loan?.schedule === undefined) {
      throw UnknownLoan.forLoan(query.loanId);
    }

    const { schedule } = loan;

    return {
      loanId: loan.id,
      status: loan.closedAt === undefined ? 'paid-out' : 'closed',
      principalCents: schedule.principal.cents,
      annualRateBasisPoints: schedule.annualRateBasisPoints,
      durationMonths: schedule.durationMonths,
      instalmentsCents: schedule.instalments.map((instalment) => instalment.cents),
      instalmentsDue: [...loan.instalmentsDue],
    };
  }
}
