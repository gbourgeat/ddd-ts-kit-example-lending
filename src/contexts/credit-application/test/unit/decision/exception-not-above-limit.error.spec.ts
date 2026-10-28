import { describe, expect, it } from '@jest/globals';
import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { ExceptionNotAboveLimit } from '@/contexts/credit-application/decision/domain/errors/exception-not-above-limit.error';

describe('ExceptionNotAboveLimit', () => {
  it('refuses an exception the limit of the decider covers, by the code EXCEPTION_NOT_ABOVE_LIMIT', () => {
    const error = ExceptionNotAboveLimit.forExceptionNotAboveLimit('advisor');

    expect(error).toBeInstanceOf(DomainRefusal);
    expect(error.code).toBe('EXCEPTION_NOT_ABOVE_LIMIT');

    expect(error.message).toBe(
      "The amount is within the decider's limit: no exception is needed, the decider decides it.",
    );
  });

  it('names the level of the decider as the fact the client may read', () => {
    const error = ExceptionNotAboveLimit.forExceptionNotAboveLimit('advisor');

    expect(error.facts).toEqual({ deciderLevel: 'advisor' });
  });
});
