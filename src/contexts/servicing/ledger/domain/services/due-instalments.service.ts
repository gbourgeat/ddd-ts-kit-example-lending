import type { LoanSchedule } from '@/contexts/servicing/ledger/domain/value-objects/loan-schedule.vo';
import { InstalmentDueDateService } from '@/contexts/servicing/ledger/domain/services/instalment-due-date.service';
import type { Money } from '@/shared-kernel/money.vo';

/** The facts of a loan the due instalments are read from. */
export interface DueInstalmentsFacts {
  readonly paidOutAt: Date;
  /** The instalments noted before the schedule in force: its instalments are numbered after them. */
  readonly notedBefore: number;
  readonly alreadyDue: readonly number[];
}

/** An instalment fallen due: its number in the loan, the instant it fell due and its amount. */
export interface DueInstalment {
  readonly number: number;
  readonly dueOn: Date;
  readonly amount: Money;
}

/** The instalments of the schedule in force that have fallen due by an instant and are not noted yet. */
export class DueInstalmentsService {
  of(schedule: LoanSchedule, facts: DueInstalmentsFacts, now: Date): readonly DueInstalment[] {
    const dueDates = new InstalmentDueDateService();

    return schedule.instalments
      .map((amount, index) => {
        const number = facts.notedBefore + index + 1;

        return { number, dueOn: dueDates.dueOn(facts.paidOutAt, number), amount };
      })
      .filter((due) => due.dueOn.getTime() <= now.getTime() && !facts.alreadyDue.includes(due.number));
  }
}
