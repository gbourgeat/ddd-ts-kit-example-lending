import { describe, expect, it } from '@jest/globals';
import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { NotDecided } from '@/contexts/credit-application/decision/domain/errors/not-decided.error';

describe('NotDecided', () => {
  it('refuses for not decided with the code NOT_DECIDED', () => {
    const error = NotDecided.forNotDecided();

    expect(error).toBeInstanceOf(DomainRefusal);
    expect(error.code).toBe('NOT_DECIDED');
    expect(error.message).toBe('The application has no decision yet: there is nothing the decider saw to show.');
    expect(error.facts).toEqual({});
  });
});
