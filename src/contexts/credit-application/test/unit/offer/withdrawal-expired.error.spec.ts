import { describe, expect, it } from '@jest/globals';
import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { WithdrawalExpired } from '@/contexts/credit-application/offer/domain/errors/withdrawal-expired.error';

describe('WithdrawalExpired', () => {
  it('refuses a withdrawal after its 14 days with the code WITHDRAWAL_EXPIRED', () => {
    const error = WithdrawalExpired.forExpiry(new Date('2026-04-16T09:00:00.000Z'));

    expect(error).toBeInstanceOf(DomainRefusal);
    expect(error.code).toBe('WITHDRAWAL_EXPIRED');
  });
});
