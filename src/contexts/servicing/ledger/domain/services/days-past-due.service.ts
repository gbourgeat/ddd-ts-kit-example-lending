import { InstalmentDueDateService } from '@/contexts/servicing/ledger/domain/services/instalment-due-date.service';
import type { LoanState } from '@/contexts/servicing/ledger/domain/values/loan-state';

const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

/** The days past due of a loan: the whole days since its oldest unpaid instalment fell due. */
export class DaysPastDueService {
  /** The whole days past due at `now`: zero while no instalment is unpaid, the oldest unpaid one counting from its due date. */
  of(state: LoanState, now: Date): number {
    const unpaid = state.instalmentsUnpaid.filter((number) => !state.instalmentsPaid.includes(number));

    if (unpaid.length === 0) {
      return 0;
    }

    const dueOn = new InstalmentDueDateService().dueOn(state.registeredAt, Math.min(...unpaid));

    return Math.max(0, Math.floor((now.getTime() - dueOn.getTime()) / MILLISECONDS_PER_DAY));
  }
}
