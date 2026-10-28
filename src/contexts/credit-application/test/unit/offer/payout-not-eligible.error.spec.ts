import { describe, expect, it } from '@jest/globals';
import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { PayoutNotEligible } from '@/contexts/credit-application/offer/domain/errors/payout-not-eligible.error';

describe('PayoutNotEligible', () => {
  it('refuses the payout to an ineligible customer with the code PAYOUT_NOT_ELIGIBLE', () => {
    const error = PayoutNotEligible.forIneligibility('due-diligence-overdue');

    expect(error).toBeInstanceOf(DomainRefusal);
    expect(error.code).toBe('PAYOUT_NOT_ELIGIBLE');
  });
});
