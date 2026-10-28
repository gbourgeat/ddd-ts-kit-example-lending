import { describe, expect, it } from '@jest/globals';
import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { PreparerCannotDecide } from '@/contexts/credit-application/decision/domain/errors/preparer-cannot-decide.error';

describe('PreparerCannotDecide', () => {
  it('refuses the decision of the preparer with the code PREPARER_CANNOT_DECIDE', () => {
    const error = PreparerCannotDecide.forPreparerCannotDecide();

    expect(error).toBeInstanceOf(DomainRefusal);
    expect(error.code).toBe('PREPARER_CANNOT_DECIDE');
    expect(error.message).toBe('The person who prepared the application never decides it.');
    expect(error.facts).toEqual({});
  });
});
