import { CreditApplicationRefusalReviewed } from '@/contexts/credit-application/file/domain/events/credit-application-refusal-reviewed.event';
import { InvalidReviewReason } from '@/contexts/credit-application/file/domain/errors/invalid-review-reason.error';
import { NoRefusalToReview } from '@/contexts/credit-application/file/domain/errors/no-refusal-to-review.error';
import { RefusalAlreadyReviewed } from '@/contexts/credit-application/file/domain/errors/refusal-already-reviewed.error';
import { ReviewerCannotBeAssessor } from '@/contexts/credit-application/file/domain/errors/reviewer-cannot-be-assessor.error';
import type { RefusalConclusion } from '@/contexts/credit-application/file/domain/values/refusal-conclusion';

/**
 * The check of a person's review of the refusal the last assessment proposed: the reason is written, a refusal was
 * proposed and not reviewed yet, and the reviewer is not the person who ran the assessment.
 */
export class RefusalReviewService {
  eventOf(
    aggregateId: string,
    file: {
      readonly lastAssessment: { readonly proposedOutcome: string; readonly assessorId: string } | undefined;
      readonly refusalReviewConclusion: RefusalConclusion | undefined;
    },
    review: {
      readonly reviewerId: string;
      readonly conclusion: RefusalConclusion;
      readonly reason: string;
      readonly reviewedAt: Date;
    },
  ): CreditApplicationRefusalReviewed {
    if (review.reason.trim() === '') {
      throw InvalidReviewReason.forReason();
    }

    if (file.lastAssessment?.proposedOutcome !== 'refuse') {
      throw NoRefusalToReview.forApplication();
    }

    if (file.refusalReviewConclusion !== undefined) {
      throw RefusalAlreadyReviewed.forApplication();
    }

    if (review.reviewerId === file.lastAssessment.assessorId) {
      throw ReviewerCannotBeAssessor.forApplication();
    }

    return new CreditApplicationRefusalReviewed(
      aggregateId,
      review.reviewedAt,
      review.reviewerId,
      review.conclusion,
      review.reason,
    );
  }
}
