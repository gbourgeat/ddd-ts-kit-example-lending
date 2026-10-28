import { CreditApplicationRescheduleDecided } from '@/contexts/credit-application/decision/domain/events/credit-application-reschedule-decided.event';
import { ReschedulingNotApproved } from '@/contexts/credit-application/decision/domain/errors/rescheduling-not-approved.error';
import { DecisionOutcome } from '@/contexts/credit-application/decision/domain/vocabularies/decision-outcome.vocabulary';
import { InvalidDuration } from '@/contexts/credit-application/file/domain/errors/invalid-duration.error';
import type { ReschedulingInput } from '@/contexts/credit-application/file/domain/values/rescheduling-input';

/**
 * The checks of a rescheduling against the file: the application was decided and approved, and the new duration is a
 * positive whole number of months. The rate and the amount are not touched.
 */
export class ReschedulingCheckService {
  eventOf(
    aggregateId: string,
    file: { readonly decision: { readonly outcome: string } | undefined },
    rescheduling: ReschedulingInput,
  ): CreditApplicationRescheduleDecided {
    if (!this.isApproved(file.decision)) {
      throw ReschedulingNotApproved.forApplication(aggregateId);
    }

    if (!Number.isInteger(rescheduling.durationMonths) || rescheduling.durationMonths <= 0) {
      throw InvalidDuration.forMonths(rescheduling.durationMonths);
    }

    return new CreditApplicationRescheduleDecided(
      aggregateId,
      rescheduling.decidedAt,
      rescheduling.deciderId,
      rescheduling.level,
      rescheduling.durationMonths,
      rescheduling.outstandingAmountCents,
    );
  }

  private isApproved(decision: { readonly outcome: string } | undefined): boolean {
    return decision !== undefined && decision.outcome !== DecisionOutcome.Refuse;
  }
}
