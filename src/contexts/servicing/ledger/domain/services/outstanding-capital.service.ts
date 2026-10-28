import { InstalmentScheduleService } from '@/contexts/servicing/ledger/domain/services/instalment-schedule.service';
import type { LoanSchedule } from '@/contexts/servicing/ledger/domain/value-objects/loan-schedule.vo';
import { Money } from '@/shared-kernel/money.vo';

/** The capital a loan still owes: its principal less what its noted instalments repaid of it, less the amounts taken off it. */
export class OutstandingCapitalService {
  /** The capital owed after the first `notedInstalments` instalments, less each of the `repaid` amounts (early repayments, write-off). */
  of(schedule: LoanSchedule, notedInstalments: number, repaid: readonly Money[]): Money {
    const afterInstalments = new InstalmentScheduleService().balanceAfter(schedule, notedInstalments);
    const deducted = repaid.reduce((sum, amount) => sum + amount.cents, 0);

    return Money.ofCents(afterInstalments.cents - deducted);
  }
}
