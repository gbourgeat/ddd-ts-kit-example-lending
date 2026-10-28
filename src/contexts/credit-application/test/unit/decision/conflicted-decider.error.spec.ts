import { describe, expect, it } from '@jest/globals';
import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { ConflictedDecider } from '@/contexts/credit-application/decision/domain/errors/conflicted-decider.error';

describe('ConflictedDecider', () => {
  it('refuses a decider who declared a conflict on the applicant, with the code CONFLICTED_DECIDER', () => {
    const error = ConflictedDecider.forConflictedDecider();

    expect(error).toBeInstanceOf(DomainRefusal);
    expect(error.code).toBe('CONFLICTED_DECIDER');

    expect(error.message).toBe(
      'The person who declared a conflict of interest on the applicant never decides the application.',
    );

    expect(error.facts).toEqual({});
  });
});
