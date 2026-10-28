import { describe, expect, it } from '@jest/globals';
import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { InvalidDecisionConditions } from '@/contexts/credit-application/file/domain/errors/invalid-decision-conditions.error';

describe('InvalidDecisionConditions', () => {
  it('refuses an approval with conditions that states none, with the code INVALID_DECISION_CONDITIONS', () => {
    const error = InvalidDecisionConditions.forConditions();

    expect(error).toBeInstanceOf(DomainRefusal);
    expect(error.code).toBe('INVALID_DECISION_CONDITIONS');

    expect(error.message).toBe(
      'An approval with conditions needs its written conditions and a lower amount, within the requested one.',
    );

    expect(error.facts).toEqual({});
  });
});
