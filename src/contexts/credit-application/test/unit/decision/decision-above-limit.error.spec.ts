import { describe, expect, it } from '@jest/globals';
import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { DecisionAboveLimit } from '@/contexts/credit-application/decision/domain/errors/decision-above-limit.error';

describe('DecisionAboveLimit', () => {
  it('refuses above the limit with the code DECISION_ABOVE_LIMIT, exposing the level needed', () => {
    const error = DecisionAboveLimit.forAboveLimit('credit-analyst');

    expect(error).toBeInstanceOf(DomainRefusal);
    expect(error.code).toBe('DECISION_ABOVE_LIMIT');
    expect(error.message).toBe("The amount is above the decider's limit: a higher level must decide.");
    expect(error.facts).toEqual({ levelNeeded: 'credit-analyst' });
  });
});
