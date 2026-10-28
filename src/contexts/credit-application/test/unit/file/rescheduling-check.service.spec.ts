import { describe, expect, it } from '@jest/globals';
import { expectRefusal } from '@ddd-ts-kit/testing';
import { ReschedulingCheckService } from '@/contexts/credit-application/file/domain/services/rescheduling-check.service';
import type { ReschedulingInput } from '@/contexts/credit-application/file/domain/values/rescheduling-input';

const decidedAt = new Date('2026-01-01T00:00:00.000Z');
const approved = { decision: { outcome: 'approve' } };

const rescheduling: ReschedulingInput = {
  deciderId: 'advisor-1',
  level: 'advisor',
  durationMonths: 48,
  outstandingAmountCents: 1_000_000,
  decidedAt,
};

describe('ReschedulingCheckService', () => {
  it('holds no state of its own', () => {
    expect(Object.keys(new ReschedulingCheckService())).toEqual([]);
  });

  it('records the rescheduling of an approved application with its new duration and outstanding amount', () => {
    const event = new ReschedulingCheckService().eventOf('credit-application-1', approved, rescheduling);

    expect({ durationMonths: event.durationMonths, outstandingAmountCents: event.outstandingAmountCents }).toEqual({
      durationMonths: 48,
      outstandingAmountCents: 1_000_000,
    });
  });

  it('refuses a rescheduling of an application with no decision, by its code', () => {
    expectRefusal(
      () => new ReschedulingCheckService().eventOf('credit-application-1', { decision: undefined }, rescheduling),
      'RESCHEDULING_NOT_APPROVED',
    );
  });

  it('refuses a rescheduling of an application the decision refused, by its code', () => {
    expectRefusal(
      () =>
        new ReschedulingCheckService().eventOf(
          'credit-application-1',
          { decision: { outcome: 'refuse' } },
          rescheduling,
        ),
      'RESCHEDULING_NOT_APPROVED',
    );
  });

  it('refuses a new duration that is not a positive whole number of months, by its code', () => {
    expectRefusal(
      () =>
        new ReschedulingCheckService().eventOf('credit-application-1', approved, {
          ...rescheduling,
          durationMonths: 0,
        }),
      'INVALID_DURATION',
    );
  });
});
