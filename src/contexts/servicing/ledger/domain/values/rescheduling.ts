import type { LoanSchedule } from '@/contexts/servicing/ledger/domain/value-objects/loan-schedule.vo';
import type { Money } from '@/shared-kernel/money.vo';

/** The schedule that replaced the one of the payout, from the instalments noted due before it and the capital repaid before it. */
export interface Rescheduling {
  readonly schedule: LoanSchedule;
  /** The instalments noted due before the rescheduling: the new schedule is numbered after them. */
  readonly notedBefore: number;
  /** The capital repaid early before the rescheduling, already out of the capital it covers. */
  readonly earlyRepaidBefore: Money;
}
