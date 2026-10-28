import { describe, expect, it } from '@jest/globals';
import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { InvalidScore } from '@/contexts/credit-scoring/domain/errors/invalid-score.error';

describe('InvalidScore', () => {
  it('refuses for value with the code INVALID_SCORE', () => {
    const error = InvalidScore.forValue(101);

    expect(error).toBeInstanceOf(DomainRefusal);
    expect(error.code).toBe('INVALID_SCORE');
    expect(error.message).toBe('A score is a whole number from 0 to 100.');
    expect(error.facts).toEqual({ value: 101 });
  });
});
