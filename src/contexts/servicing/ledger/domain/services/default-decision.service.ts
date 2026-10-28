import { DaysPastDueService } from '@/contexts/servicing/ledger/domain/services/days-past-due.service';
import type { LoanState } from '@/contexts/servicing/ledger/domain/values/loan-state';

const DEFAULT_DAYS_PAST_DUE = 90;

/** The default of a loan: an open loan 90 days past due is declared in default, handed to collections, once. */
export class DefaultDecisionService {
  /** Whether the loan is declared in default at `now`: open, not declared yet, and at the limit of days past due or over. */
  isDeclaredAt(state: LoanState, now: Date): boolean {
    if (state.closedAt !== undefined || state.defaultedAt !== undefined) {
      return false;
    }

    return new DaysPastDueService().of(state, now) >= DEFAULT_DAYS_PAST_DUE;
  }
}
