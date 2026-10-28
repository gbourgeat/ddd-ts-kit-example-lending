import { describe, expect, it } from '@jest/globals';
import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { PayoutTooEarly } from '@/contexts/credit-application/offer/domain/errors/payout-too-early.error';

describe('PayoutTooEarly', () => {
  it('refuses an early payout with the code PAYOUT_TOO_EARLY', () => {
    const error = PayoutTooEarly.forEarlyPayout(new Date('2026-04-10T09:00:00.000Z'));

    expect(error).toBeInstanceOf(DomainRefusal);
    expect(error.code).toBe('PAYOUT_TOO_EARLY');
  });
});
