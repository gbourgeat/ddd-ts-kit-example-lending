import { InstalmentScheduleService } from '@/contexts/servicing/ledger/domain/services/instalment-schedule.service';
import type { LoanSchedule } from '@/contexts/servicing/ledger/domain/value-objects/loan-schedule.vo';
import type { LoanState } from '@/contexts/servicing/ledger/domain/values/loan-state';
import { Money } from '@/shared-kernel/money.vo';

/** The capital a loan still owes: its principal less what its noted instalments repaid of it, less the amounts taken off it. */
export class OutstandingCapitalService {
  /** The capital owed after the first `notedInstalments` instalments, less each of the `repaid` amounts (early repayments, write-off). */
  of(schedule: LoanSchedule, notedInstalments: number, repaid: readonly Money[]): Money {
    const afterInstalments = new InstalmentScheduleService().balanceAfter(schedule, notedInstalments);
    const deducted = repaid.reduce((sum, amount) => sum + amount.cents, 0);

    return Money.ofCents(afterInstalments.cents - deducted);
  }

  /** The capital owed by the loan in its state: nothing before its payout, the schedule in force otherwise. */
  ofLoan(state: LoanState): Money {
    const schedule = state.rescheduling?.schedule ?? state.schedule;

    if (schedule === undefined) {
      return Money.ofCents(0);
    }

    const notedBefore = state.rescheduling?.notedBefore ?? 0;
    const writtenOff = state.writtenOff === undefined ? [] : [state.writtenOff];
    const earlyRepaid = state.earlyRepaid.cents - (state.rescheduling?.earlyRepaidBefore.cents ?? 0);

    return this.of(schedule, state.instalmentsDue.length - notedBefore, [Money.ofCents(earlyRepaid), ...writtenOff]);
  }
}
