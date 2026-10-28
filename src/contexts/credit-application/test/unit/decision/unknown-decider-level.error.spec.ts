import { describe, expect, it } from '@jest/globals';
import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { UnknownDeciderLevel } from '@/contexts/credit-application/decision/domain/errors/unknown-decider-level.error';

describe('UnknownDeciderLevel', () => {
  it('refuses for unknown decider level with the code UNKNOWN_DECIDER_LEVEL', () => {
    const error = UnknownDeciderLevel.forUnknownDeciderLevel();

    expect(error).toBeInstanceOf(DomainRefusal);
    expect(error.code).toBe('UNKNOWN_DECIDER_LEVEL');
    expect(error.message).toBe('Unknown decider level.');
    expect(error.facts).toEqual({});
  });
});
