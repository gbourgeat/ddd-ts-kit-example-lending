import { describe, expect, it } from '@jest/globals';
import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { NotCreditCommittee } from '@/contexts/credit-application/decision/domain/errors/not-credit-committee.error';

describe('NotCreditCommittee', () => {
  it('refuses a decider below the committee with the code NOT_CREDIT_COMMITTEE and its level', () => {
    const error = NotCreditCommittee.forNotCreditCommittee('advisor');

    expect(error).toBeInstanceOf(DomainRefusal);
    expect(error.code).toBe('NOT_CREDIT_COMMITTEE');
    expect(error.facts).toEqual({ deciderLevel: 'advisor' });
  });
});
