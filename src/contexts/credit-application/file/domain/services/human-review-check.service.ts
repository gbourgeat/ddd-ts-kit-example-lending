import { CreditApplicationHumanReviewRequested } from '@/contexts/credit-application/file/domain/events/credit-application-human-review-requested.event';
import { HumanReviewNotAvailable } from '@/contexts/credit-application/file/domain/errors/human-review-not-available.error';
import { DecisionOutcome } from '@/contexts/credit-application/decision/domain/vocabularies/decision-outcome.vocabulary';

/**
 * The applicant asks for a human review only of a refusal standing on the application: the decided refusal, or the refusal the
 * assessment proposed while no one decided yet. An approval, decided or proposed, has no refusal to review.
 */
export class HumanReviewCheckService {
  eventOf(
    aggregateId: string,
    file: {
      readonly decision: { readonly outcome: string } | undefined;
      readonly lastAssessment: { readonly proposedOutcome: string } | undefined;
    },
    request: { readonly requesterId: string; readonly requestedAt: Date },
  ): CreditApplicationHumanReviewRequested {
    if (!this.refusalStands(file)) {
      throw HumanReviewNotAvailable.forHumanReviewNotAvailable();
    }

    return new CreditApplicationHumanReviewRequested(aggregateId, request.requestedAt, request.requesterId);
  }

  /** The decision speaks when there is one, otherwise the outcome the last assessment proposed. */
  private refusalStands(file: {
    readonly decision: { readonly outcome: string } | undefined;
    readonly lastAssessment: { readonly proposedOutcome: string } | undefined;
  }): boolean {
    const standing = file.decision?.outcome ?? file.lastAssessment?.proposedOutcome;

    return standing === DecisionOutcome.Refuse;
  }
}
