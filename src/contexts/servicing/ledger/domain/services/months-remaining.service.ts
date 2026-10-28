import { InstalmentDueDateService } from '@/contexts/servicing/ledger/domain/services/instalment-due-date.service';
import type { LoanState } from '@/contexts/servicing/ledger/domain/values/loan-state';

/** The months of a schedule still to run at an instant: the monthly due dates passed since the payout are counted. */
export class MonthsRemainingService {
  /** The months still to run of the schedule in force of the loan in its state, at `now`. */
  ofLoan(state: LoanState, now: Date): number {
    const notedBefore = state.rescheduling?.notedBefore ?? 0;
    const schedule = state.rescheduling?.schedule ?? state.schedule;
    const lastNumber = notedBefore + (schedule?.durationMonths ?? 0);

    return this.of({ paidOutAt: state.registeredAt, now, notedBefore, lastNumber });
  }

  /** The months still to run of the schedule in force, from the instalments noted due before it up to its last number. */
  of(schedule: {
    readonly paidOutAt: Date;
    readonly now: Date;
    readonly notedBefore: number;
    readonly lastNumber: number;
  }): number {
    const dueDates = new InstalmentDueDateService();
    let passed = 0;

    while (
      passed < schedule.lastNumber &&
      dueDates.dueOn(schedule.paidOutAt, passed + 1).getTime() <= schedule.now.getTime()
    ) {
      passed += 1;
    }

    return schedule.lastNumber - Math.max(passed, schedule.notedBefore);
  }
}
