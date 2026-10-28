import { describe, expect, it } from '@jest/globals';
import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { InvalidReviewReason } from '@/contexts/credit-application/file/domain/errors/invalid-review-reason.error';

describe('InvalidReviewReason', () => {
  it('refuses for reason with the code INVALID_REVIEW_REASON', () => {
    const error = InvalidReviewReason.forReason();

    expect(error).toBeInstanceOf(DomainRefusal);
    expect(error.code).toBe('INVALID_REVIEW_REASON');
    expect(error.message).toBe('A review needs a written reason.');
    expect(error.facts).toEqual({});
  });
});
