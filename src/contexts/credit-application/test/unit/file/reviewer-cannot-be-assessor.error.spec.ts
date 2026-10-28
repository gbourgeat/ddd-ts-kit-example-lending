import { describe, expect, it } from '@jest/globals';
import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { ReviewerCannotBeAssessor } from '@/contexts/credit-application/file/domain/errors/reviewer-cannot-be-assessor.error';

describe('ReviewerCannotBeAssessor', () => {
  it('refuses for application with the code REVIEWER_CANNOT_BE_ASSESSOR', () => {
    const error = ReviewerCannotBeAssessor.forApplication();

    expect(error).toBeInstanceOf(DomainRefusal);
    expect(error.code).toBe('REVIEWER_CANNOT_BE_ASSESSOR');
    expect(error.message).toBe('The reviewer cannot be the person who ran the assessment.');
    expect(error.facts).toEqual({});
  });
});
