import { describe, expect, it } from '@jest/globals';
import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { InvalidExceptionJustification } from '@/contexts/credit-application/file/domain/errors/invalid-exception-justification.error';

describe('InvalidExceptionJustification', () => {
  it('refuses an exception without its justification in words, by the code INVALID_EXCEPTION_JUSTIFICATION', () => {
    const error = InvalidExceptionJustification.forInvalidExceptionJustification();

    expect(error).toBeInstanceOf(DomainRefusal);
    expect(error.code).toBe('INVALID_EXCEPTION_JUSTIFICATION');

    expect(error.message).toBe(
      'An exception needs its justification in words: the level above decides on the reasons given.',
    );

    expect(error.facts).toEqual({});
  });
});
