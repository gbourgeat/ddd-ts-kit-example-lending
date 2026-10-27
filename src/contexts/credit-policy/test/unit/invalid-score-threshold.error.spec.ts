import { describe, expect, it } from '@jest/globals';
import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { InvalidScoreThreshold } from '@/contexts/credit-policy/domain/errors/invalid-score-threshold.error';

describe('InvalidScoreThreshold', () => {
  it('refuses a score above 1000 with the code INVALID_SCORE_THRESHOLD and exposes the score', () => {
    const error = InvalidScoreThreshold.forScore(1001);

    expect(error).toBeInstanceOf(DomainRefusal);
    expect(error.code).toBe('INVALID_SCORE_THRESHOLD');
    expect(error.facts).toEqual({ score: 1001 });
  });
});
