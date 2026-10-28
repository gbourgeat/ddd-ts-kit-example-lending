import { describe, expect, it } from '@jest/globals';
import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { PayoutAfterWithdrawal } from '@/contexts/credit-application/offer/domain/errors/payout-after-withdrawal.error';

describe('PayoutAfterWithdrawal', () => {
  it('refuses the payout of a withdrawn application with the code PAYOUT_AFTER_WITHDRAWAL', () => {
    const error = PayoutAfterWithdrawal.forWithdrawal('application-1');

    expect(error).toBeInstanceOf(DomainRefusal);
    expect(error.code).toBe('PAYOUT_AFTER_WITHDRAWAL');
  });
});
