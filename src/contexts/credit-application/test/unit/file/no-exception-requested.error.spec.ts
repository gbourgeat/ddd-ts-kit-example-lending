import { describe, expect, it } from '@jest/globals';
import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { NoExceptionRequested } from '@/contexts/credit-application/file/domain/errors/no-exception-requested.error';

describe('NoExceptionRequested', () => {
  it('refuses for no exception requested with the code NO_EXCEPTION_REQUESTED', () => {
    const error = NoExceptionRequested.forNoExceptionRequested();

    expect(error).toBeInstanceOf(DomainRefusal);
    expect(error.code).toBe('NO_EXCEPTION_REQUESTED');
    expect(error.facts).toEqual({});
  });
});
