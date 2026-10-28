import { InstalmentDueDateService } from '@/contexts/servicing/ledger/domain/services/instalment-due-date.service';

/** The months of a schedule still to run at an instant: the monthly due dates passed since the payout are counted. */
export class MonthsRemainingService {
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
