import { describe, expect, it } from '@jest/globals';
import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { InvalidExceptionJustification } from '@/contexts/credit-application/file/domain/errors/invalid-exception-justification.error';

describe('InvalidExceptionJustification', () => {
  it('refuses for invalid exception justification with the code INVALID_EXCEPTION_JUSTIFICATION', () => {
    const error = InvalidExceptionJustification.forInvalidExceptionJustification();

    expect(error).toBeInstanceOf(DomainRefusal);
    expect(error.code).toBe('INVALID_EXCEPTION_JUSTIFICATION');
    expect(error.message).toBe('Invalid exception justification.');
    expect(error.facts).toEqual({});
  });
});
