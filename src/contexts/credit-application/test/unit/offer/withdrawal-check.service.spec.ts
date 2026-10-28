import { describe, expect, it } from '@jest/globals';
import { expectRefusal } from '@ddd-ts-kit/testing';
import { WithdrawalCheckService } from '@/contexts/credit-application/offer/domain/services/withdrawal-check.service';

const DAY = 24 * 60 * 60 * 1000;
const SIGNED_ON = new Date('2026-04-02T09:00:00.000Z');
const FOURTEEN_DAYS_AFTER = new Date(SIGNED_ON.getTime() + 14 * DAY);

describe('WithdrawalCheckService', () => {
  it('holds no state of its own', () => {
    expect(Object.keys(new WithdrawalCheckService())).toEqual([]);
  });

  it('records the withdrawal of a signed offer made within the 14 days', () => {
    const event = new WithdrawalCheckService().eventOf('application-1', withdrawal());

    expect(event.name).toBe('credit-application.credit-application.withdrawn');
    expect(event.aggregateId).toBe('application-1');
  });

  it('accepts the withdrawal on the 14th day, the last instant of its limit', () => {
    expect(() =>
      new WithdrawalCheckService().eventOf('application-1', withdrawal({ now: FOURTEEN_DAYS_AFTER })),
    ).not.toThrow();
  });

  it('refuses the withdrawal one millisecond after the 14th day, by its code', () => {
    const late = new Date(FOURTEEN_DAYS_AFTER.getTime() + 1);

    expectRefusal(
      () => new WithdrawalCheckService().eventOf('application-1', withdrawal({ now: late })),
      'WITHDRAWAL_EXPIRED',
    );
  });

  it('refuses a second withdrawal, by its code', () => {
    expectRefusal(
      () => new WithdrawalCheckService().eventOf('application-1', withdrawal({ alreadyWithdrawn: true })),
      'WITHDRAWAL_ALREADY_RECORDED',
    );
  });

  it('refuses a withdrawal of an application with no signed offer, by its code', () => {
    expectRefusal(
      () => new WithdrawalCheckService().eventOf('application-1', withdrawal({ signedAt: undefined })),
      'OFFER_NOT_SIGNED',
    );
  });
});

function withdrawal(overrides: { alreadyWithdrawn?: boolean; signedAt?: Date | undefined; now?: Date } = {}) {
  return {
    alreadyWithdrawn: false,
    signedAt: SIGNED_ON,
    now: new Date(SIGNED_ON.getTime() + DAY),
    ...overrides,
  };
}
