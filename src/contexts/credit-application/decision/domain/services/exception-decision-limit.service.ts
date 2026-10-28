import { ConflictedDecider } from '@/contexts/credit-application/decision/domain/errors/conflicted-decider.error';
import { NotCreditCommittee } from '@/contexts/credit-application/decision/domain/errors/not-credit-committee.error';
import { PreparerCannotDecide } from '@/contexts/credit-application/decision/domain/errors/preparer-cannot-decide.error';

/** The level that decides an exception to the policy. */
const CREDIT_COMMITTEE = 'credit-committee';

/**
 * Only the credit committee decides an exception to the policy: neither the person who prepared the file nor a person who
 * declared a conflict of interest on the applicant may decide it.
 */
export class ExceptionDecisionLimitService {
  check(decision: {
    readonly deciderId: string;
    readonly level: string;
    readonly preparerIds: readonly string[];
    readonly conflictedIds: readonly string[];
  }): void {
    if (decision.preparerIds.includes(decision.deciderId)) {
      throw PreparerCannotDecide.forPreparerCannotDecide();
    }

    if (decision.conflictedIds.includes(decision.deciderId)) {
      throw ConflictedDecider.forConflictedDecider();
    }

    if (decision.level !== CREDIT_COMMITTEE) {
      throw NotCreditCommittee.forNotCreditCommittee(decision.level);
    }
  }
}
