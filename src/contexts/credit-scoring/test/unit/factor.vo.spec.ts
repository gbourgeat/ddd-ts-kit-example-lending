import { describe, expect, it } from '@jest/globals';
import { expectRefusal } from '@ddd-ts-kit/testing';
import { Factor } from '@/contexts/credit-scoring/domain/value-objects/factor.vo';

describe('Factor', () => {
  it('is equal to another factor with the same words and harm', () => {
    const first = Factor.create('Late payments on a previous loan', 12);
    const second = Factor.create('Late payments on a previous loan', 12);

    expect(first.equals(second)).toBe(true);
  });

  it('keeps the words stated for the customer and the points it takes off the score', () => {
    const factor = Factor.create('Late payments on a previous loan', 12);

    expect(factor.words).toBe('Late payments on a previous loan');
    expect(factor.harm).toBe(12);
  });

  it('states its words without the spaces around them', () => {
    const factor = Factor.create('  Short employment  ', 3);

    expect(factor.words).toBe('Short employment');
  });

  it('refuses empty words with the code INVALID_FACTOR', () => {
    expectRefusal(() => Factor.create('   ', 12), 'INVALID_FACTOR');
  });

  it('refuses a factor that takes no point off the score with the code INVALID_FACTOR', () => {
    expectRefusal(() => Factor.create('Short employment', 0), 'INVALID_FACTOR');
  });

  it('refuses a harm that is not a whole number with the code INVALID_FACTOR', () => {
    expectRefusal(() => Factor.create('Short employment', 2.5), 'INVALID_FACTOR');
  });
});
