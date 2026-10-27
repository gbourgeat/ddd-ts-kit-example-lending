import { describe, expect, it } from '@jest/globals';
import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { ClosureReasonMissing } from '@/contexts/financial-crime/domain/errors/closure-reason-missing.error';

describe('ClosureReasonMissing', () => {
  it('refuses for alert with the code CLOSURE_REASON_MISSING', () => {
    const error = ClosureReasonMissing.forAlert();

    expect(error).toBeInstanceOf(DomainRefusal);
    expect(error.code).toBe('CLOSURE_REASON_MISSING');
    expect(error.message).toBe('Closure reason missing.');
    expect(error.facts).toEqual({});
  });
});
