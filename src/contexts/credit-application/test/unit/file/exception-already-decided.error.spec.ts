import { describe, expect, it } from '@jest/globals';
import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { ExceptionAlreadyDecided } from '@/contexts/credit-application/file/domain/errors/exception-already-decided.error';

describe('ExceptionAlreadyDecided', () => {
  it('refuses an exception already decided with the code EXCEPTION_ALREADY_DECIDED', () => {
    const error = ExceptionAlreadyDecided.forExceptionAlreadyDecided();

    expect(error).toBeInstanceOf(DomainRefusal);
    expect(error.code).toBe('EXCEPTION_ALREADY_DECIDED');
    expect(error.facts).toEqual({});
  });
});
