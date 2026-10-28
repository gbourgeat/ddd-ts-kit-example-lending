import { describe, expect, it } from '@jest/globals';
import { expectRefusal } from '@ddd-ts-kit/testing';
import { RefusalReviewService } from '@/contexts/credit-application/file/domain/services/refusal-review.service';

const reviewedAt = new Date('2026-02-01T10:00:00.000Z');

const refusedByAssessment = {
  lastAssessment: { proposedOutcome: 'refuse', assessorId: 'credit-analyst-1' },
  refusalReviewConclusion: undefined,
} as const;

const review = {
  reviewerId: 'second-analyst-1',
  conclusion: 'overturn',
  reason: 'The register lists a homonym.',
  reviewedAt,
} as const;

describe('RefusalReviewService', () => {
  it('holds no state of its own', () => {
    expect(Object.keys(new RefusalReviewService())).toEqual([]);
  });

  it('records the review of a proposed refusal by a person who is not the assessor, with its conclusion', () => {
    const event = new RefusalReviewService().eventOf('credit-application-1', refusedByAssessment, review);

    expect(event).toMatchObject({
      aggregateId: 'credit-application-1',
      reviewerId: 'second-analyst-1',
      conclusion: 'overturn',
    });
  });

  it('refuses a review of an assessment that proposed approve, by its code', () => {
    const approved = {
      lastAssessment: { proposedOutcome: 'approve', assessorId: 'credit-analyst-1' },
      refusalReviewConclusion: undefined,
    } as const;

    expectRefusal(
      () => new RefusalReviewService().eventOf('credit-application-1', approved, review),
      'NO_REFUSAL_TO_REVIEW',
    );
  });

  it('refuses a review by the person who ran the assessment, by its code', () => {
    const own = { ...review, reviewerId: 'credit-analyst-1' };

    expectRefusal(
      () => new RefusalReviewService().eventOf('credit-application-1', refusedByAssessment, own),
      'REVIEWER_CANNOT_BE_ASSESSOR',
    );
  });

  it('refuses a review without a written reason, by its code', () => {
    const silent = { ...review, reason: '  ' };

    expectRefusal(
      () => new RefusalReviewService().eventOf('credit-application-1', refusedByAssessment, silent),
      'INVALID_REVIEW_REASON',
    );
  });
});
