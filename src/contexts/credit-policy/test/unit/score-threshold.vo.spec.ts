import { describe, expect, it } from '@jest/globals';
import { expectRefusal } from '@ddd-ts-kit/testing';
import { ScoreThreshold } from '@/contexts/credit-policy/domain/value-objects/score-threshold.vo';

describe('ScoreThreshold', () => {
  it('keeps a whole score from 0 to 1000 as its score', () => {
    const threshold = ScoreThreshold.create(600);

    expect(threshold.score).toBe(600);
  });

  it('accepts the lowest and the highest score', () => {
    expect(ScoreThreshold.create(0).score).toBe(0);
    expect(ScoreThreshold.create(1000).score).toBe(1000);
  });

  it('refuses a score above 1000 with the code INVALID_SCORE_THRESHOLD', () => {
    expectRefusal(() => ScoreThreshold.create(1001), 'INVALID_SCORE_THRESHOLD');
  });

  it('refuses a score that is not a whole number with the code INVALID_SCORE_THRESHOLD', () => {
    expectRefusal(() => ScoreThreshold.create(600.5), 'INVALID_SCORE_THRESHOLD');
  });
});
