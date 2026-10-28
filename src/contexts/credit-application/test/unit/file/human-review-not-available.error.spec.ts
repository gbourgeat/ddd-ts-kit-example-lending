import { describe, expect, it } from '@jest/globals';
import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { HumanReviewNotAvailable } from '@/contexts/credit-application/file/domain/errors/human-review-not-available.error';

describe('HumanReviewNotAvailable', () => {
  it('refuses a review of an approval, by the code HUMAN_REVIEW_NOT_AVAILABLE', () => {
    const error = HumanReviewNotAvailable.forHumanReviewNotAvailable();

    expect(error).toBeInstanceOf(DomainRefusal);
    expect(error.code).toBe('HUMAN_REVIEW_NOT_AVAILABLE');
    expect(error.facts).toEqual({});
  });
});
