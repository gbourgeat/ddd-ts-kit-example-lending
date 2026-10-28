import { describe, expect, it } from '@jest/globals';
import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { NoRefusalToReview } from '@/contexts/credit-application/file/domain/errors/no-refusal-to-review.error';

describe('NoRefusalToReview', () => {
  it('refuses for application with the code NO_REFUSAL_TO_REVIEW', () => {
    const error = NoRefusalToReview.forApplication();

    expect(error).toBeInstanceOf(DomainRefusal);
    expect(error.code).toBe('NO_REFUSAL_TO_REVIEW');

    expect(error.message).toBe(
      'No refusal to review: the application was not assessed, or its last assessment proposed no refusal.',
    );

    expect(error.facts).toEqual({});
  });
});
