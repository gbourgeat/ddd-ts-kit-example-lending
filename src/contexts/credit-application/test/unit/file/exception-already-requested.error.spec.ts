import { describe, expect, it } from '@jest/globals';
import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { ExceptionAlreadyRequested } from '@/contexts/credit-application/file/domain/errors/exception-already-requested.error';

describe('ExceptionAlreadyRequested', () => {
  it('refuses for exception already requested with the code EXCEPTION_ALREADY_REQUESTED', () => {
    const error = ExceptionAlreadyRequested.forExceptionAlreadyRequested();

    expect(error).toBeInstanceOf(DomainRefusal);
    expect(error.code).toBe('EXCEPTION_ALREADY_REQUESTED');
    expect(error.message).toBe('Exception already requested.');
    expect(error.facts).toEqual({});
  });
});
