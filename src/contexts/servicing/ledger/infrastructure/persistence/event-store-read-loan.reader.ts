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

    // The principal is the amount paid out, kept by a rescheduling; the duration and the instalments are those in force.
    const schedule = loan.currentSchedule ?? loan.schedule;

    return {
      loanId: loan.id,
      status: loan.closedAt === undefined ? 'paid-out' : 'closed',
      principalCents: loan.schedule.principal.cents,
      annualRateBasisPoints: loan.schedule.annualRateBasisPoints,
      durationMonths: schedule.durationMonths,
      instalmentsCents: schedule.instalments.map((instalment) => instalment.cents),
      instalmentsDue: [...loan.instalmentsDue],
      instalmentsPaid: [...loan.instalmentsPaid],
      instalmentsUnpaid: [...loan.instalmentsUnpaid],
    };
  }
}
