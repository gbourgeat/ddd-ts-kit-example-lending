import { describe, expect, it } from '@jest/globals';
import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { NoScoreAvailable } from '@/contexts/credit-application/assessment/domain/errors/no-score-available.error';

describe('NoScoreAvailable', () => {
  it('refuses the score of an application while no version of the scoring model is published, by its code', () => {
    const error = NoScoreAvailable.forScore('credit-application-1');

    expect(error).toBeInstanceOf(DomainRefusal);
    expect(error.code).toBe('NO_SCORE_AVAILABLE');
  });
});
