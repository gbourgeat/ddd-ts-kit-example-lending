import { describe, expect, it } from '@jest/globals';
import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { InvalidDecisionReasons } from '@/contexts/credit-application/file/domain/errors/invalid-decision-reasons.error';

describe('InvalidDecisionReasons', () => {
  it('refuses a refusal without its written reasons, with the code INVALID_DECISION_REASONS', () => {
    const error = InvalidDecisionReasons.forReasons();

    expect(error).toBeInstanceOf(DomainRefusal);
    expect(error.code).toBe('INVALID_DECISION_REASONS');
    expect(error.message).toBe('A refusal needs its written reasons.');
    expect(error.facts).toEqual({});
  });
});
