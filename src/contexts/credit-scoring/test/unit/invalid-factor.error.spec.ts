import { describe, expect, it } from '@jest/globals';
import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { InvalidFactor } from '@/contexts/credit-scoring/domain/errors/invalid-factor.error';

describe('InvalidFactor', () => {
  it('refuses for words with the code INVALID_FACTOR', () => {
    const error = InvalidFactor.forWords('   ');

    expect(error).toBeInstanceOf(DomainRefusal);
    expect(error.code).toBe('INVALID_FACTOR');
    expect(error.message).toBe('A factor is stated in words, and the words are not empty.');
    expect(error.facts).toEqual({ words: '   ' });
  });

  it('refuses for harm with the code INVALID_FACTOR', () => {
    const error = InvalidFactor.forHarm(0);

    expect(error).toBeInstanceOf(DomainRefusal);
    expect(error.code).toBe('INVALID_FACTOR');
    expect(error.message).toBe('A factor takes at least one whole point off the score.');
    expect(error.facts).toEqual({ harm: 0 });
  });
});
