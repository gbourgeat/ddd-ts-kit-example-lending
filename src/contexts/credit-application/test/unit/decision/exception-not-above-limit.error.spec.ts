import { describe, expect, it } from '@jest/globals';
import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { ExceptionNotAboveLimit } from '@/contexts/credit-application/decision/domain/errors/exception-not-above-limit.error';

describe('ExceptionNotAboveLimit', () => {
  it('refuses for exception not above limit with the code EXCEPTION_NOT_ABOVE_LIMIT', () => {
    const error = ExceptionNotAboveLimit.forExceptionNotAboveLimit();

    expect(error).toBeInstanceOf(DomainRefusal);
    expect(error.code).toBe('EXCEPTION_NOT_ABOVE_LIMIT');
    expect(error.message).toBe('Exception not above limit.');
    expect(error.facts).toEqual({});
  });
});
