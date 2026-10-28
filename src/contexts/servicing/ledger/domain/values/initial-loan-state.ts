import { Money } from '@/shared-kernel/money.vo';
import type { LoanState } from '@/contexts/servicing/ledger/domain/values/loan-state';

/** The state of a loan before any event: nothing paid out, nothing due, nothing repaid. */
export function initialLoanState(): LoanState {
  return {
    registeredAt: new Date(0),
    closedAt: undefined,
    borrower: undefined,
    schedule: undefined,
    rescheduling: undefined,
    rescheduledBy: [],
    instalmentsDue: [],
    earlyRepaid: Money.ofCents(0),
    writtenOff: undefined,
    instalmentsPaid: [],
    instalmentsUnpaid: [],
  };
}
