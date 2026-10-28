import { describe, expect, it } from '@jest/globals';
import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { ExceptionAlreadyRequested } from '@/contexts/credit-application/file/domain/errors/exception-already-requested.error';

describe('ExceptionAlreadyRequested', () => {
  it('refuses a second exception on the application, by the code EXCEPTION_ALREADY_REQUESTED', () => {
    const error = ExceptionAlreadyRequested.forExceptionAlreadyRequested();

    expect(error).toBeInstanceOf(DomainRefusal);
    expect(error.code).toBe('EXCEPTION_ALREADY_REQUESTED');

    expect(error.message).toBe(
      'An exception is already requested on this application: one at a time, until the level above answers.',
    );

    expect(error.facts).toEqual({});
  });
});
