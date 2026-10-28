import { Loan } from '@/contexts/servicing/ledger/domain/aggregates/loan.aggregate';
import { LoanInstalmentDueNoted } from '@/contexts/servicing/ledger/domain/events/loan-instalment-due-noted.event';
import { UnknownLoan } from '@/contexts/servicing/ledger/domain/errors/unknown-loan.error';
import type { LoanEvent } from '@/contexts/servicing/ledger/domain/values/loan-event';
import type { LoanStatement } from '@/contexts/servicing/ledger/domain/values/loan-statement';
import { Money } from '@/shared-kernel/money.vo';

const MILLISECONDS_PER_DAY = 86_400_000;

/**
 * Replays a loan from the events it recorded up to a date, and reads its statement on that date. Nothing is stored:
 * the statement is the loan as the events say it stood, so an event recorded after the date does not show.
 */
export class LoanStatementService {
  of(loanId: string, history: readonly LoanEvent[], asOf: Date): LoanStatement {
    const events = history.filter((event) => event.occurredAt.getTime() <= asOf.getTime());
    const loan = Loan.rehydrate(loanId, { events });

    if (loan.currentSchedule === undefined) {
      throw UnknownLoan.forLoan(loanId);
    }

    const instalmentsUnpaid = loan.instalmentsUnpaid.filter((number) => !loan.instalmentsPaid.includes(number));
    const unpaidDues = this.notedDues(events).filter((due) => instalmentsUnpaid.includes(due.number));

    return {
      loanId,
      asOf,
      outstandingCapital: loan.outstandingCapital,
      arrears: Money.ofCents(unpaidDues.reduce((sum, due) => sum + due.amount.cents, 0)),
      daysPastDue: this.daysPastDue(unpaidDues, asOf),
      instalments: loan.currentSchedule.instalments,
      instalmentsDue: [...loan.instalmentsDue],
      instalmentsPaid: [...loan.instalmentsPaid],
      instalmentsUnpaid,
    };
  }

  /** The instalments noted due in the events, each with its number, its due date and its amount. */
  private notedDues(events: readonly LoanEvent[]): LoanInstalmentDueNoted[] {
    return events.filter((event) => event instanceof LoanInstalmentDueNoted);
  }

  /** The days from the due date of the oldest unpaid instalment to the date; zero when no instalment is unpaid. */
  private daysPastDue(unpaidDues: readonly LoanInstalmentDueNoted[], asOf: Date): number {
    if (unpaidDues.length === 0) {
      return 0;
    }

    const oldestDueOn = Math.min(...unpaidDues.map((due) => due.dueOn.getTime()));

    return Math.max(0, Math.floor((asOf.getTime() - oldestDueOn) / MILLISECONDS_PER_DAY));
  }
}
