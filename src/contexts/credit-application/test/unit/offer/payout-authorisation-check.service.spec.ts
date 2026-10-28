import { describe, expect, it } from '@jest/globals';
import { expectRefusal } from '@ddd-ts-kit/testing';
import { PayoutAuthorisationCheckService } from '@/contexts/credit-application/offer/domain/services/payout-authorisation-check.service';

const DAY = 24 * 60 * 60 * 1000;
const SIGNED_ON = new Date('2026-04-02T09:00:00.000Z');
const EIGHTH_DAY_AFTER = new Date(SIGNED_ON.getTime() + 8 * DAY);

describe('PayoutAuthorisationCheckService', () => {
  it('holds no state of its own', () => {
    expect(Object.keys(new PayoutAuthorisationCheckService())).toEqual([]);
  });

  it('authorises the payout of an eligible customer on the 8th day after the signing', () => {
    const event = new PayoutAuthorisationCheckService().eventOf('application-1', payout());

    expect(event.name).toBe('credit-application.credit-application.payout-authorised');
  });

  it('refuses the payout on the 7th day after the signing, by its code', () => {
    const seventhDay = new Date(SIGNED_ON.getTime() + 7 * DAY);

    expectRefusal(
      () => new PayoutAuthorisationCheckService().eventOf('application-1', payout({ now: seventhDay })),
      'PAYOUT_TOO_EARLY',
    );
  });

  it('refuses the payout of a withdrawn application, by its code', () => {
    expectRefusal(
      () => new PayoutAuthorisationCheckService().eventOf('application-1', payout({ withdrawn: true })),
      'PAYOUT_AFTER_WITHDRAWAL',
    );
  });

  it('refuses the payout to an ineligible customer, by its code', () => {
    expectRefusal(
      () =>
        new PayoutAuthorisationCheckService().eventOf(
          'application-1',
          payout({ ineligibility: 'due-diligence-overdue' }),
        ),
      'PAYOUT_NOT_ELIGIBLE',
    );
  });

  it('refuses the payout of an application with no signed offer, by its code', () => {
    expectRefusal(
      () => new PayoutAuthorisationCheckService().eventOf('application-1', payout({ signedAt: undefined })),
      'OFFER_NOT_SIGNED',
    );
  });
});

function payout(
  overrides: { withdrawn?: boolean; signedAt?: Date | undefined; ineligibility?: string; now?: Date } = {},
) {
  return {
    withdrawn: false,
    signedAt: SIGNED_ON,
    ineligibility: undefined,
    now: EIGHTH_DAY_AFTER,
    ...overrides,
  };
}
