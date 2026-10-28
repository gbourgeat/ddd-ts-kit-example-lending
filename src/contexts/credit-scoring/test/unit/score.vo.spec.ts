import { describe, expect, it } from '@jest/globals';
import { expectRefusal } from '@ddd-ts-kit/testing';
import { Score } from '@/contexts/credit-scoring/domain/value-objects/score.vo';
import { Band } from '@/contexts/credit-scoring/domain/vocabularies/band.vocabulary';

describe('Score', () => {
  it('is equal to another score with the same value', () => {
    const first = Score.create(55);
    const second = Score.create(55);

    expect(first.equals(second)).toBe(true);
    expect(first.value).toBe(55);
  });

  it('accepts the whole numbers from 0 to 100 as scores', () => {
    const lowest = Score.create(0);
    const highest = Score.create(100);

    expect(lowest.value).toBe(0);
    expect(highest.value).toBe(100);
  });

  it('refuses a score above 100 with the code INVALID_SCORE', () => {
    expectRefusal(() => Score.create(101), 'INVALID_SCORE');
  });

  it('refuses a score below 0 with the code INVALID_SCORE', () => {
    expectRefusal(() => Score.create(-1), 'INVALID_SCORE');
  });

  it('refuses a score that is not a whole number with the code INVALID_SCORE', () => {
    expectRefusal(() => Score.create(55.5), 'INVALID_SCORE');
  });

  it('puts a score below 40 in the red band', () => {
    expect(Score.create(39).band()).toBe(Band.Red);
  });

  it('puts a score of 40 in the amber band', () => {
    expect(Score.create(40).band()).toBe(Band.Amber);
  });

  it('keeps a score of 69 in the amber band, never shown green', () => {
    expect(Score.create(69).band()).toBe(Band.Amber);
  });

  it('puts a score of 70 in the green band, the only band an advisor decides with', () => {
    expect(Score.create(70).band()).toBe(Band.Green);
  });
});
