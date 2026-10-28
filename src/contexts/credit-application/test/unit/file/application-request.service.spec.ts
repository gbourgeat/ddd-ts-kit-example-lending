import { describe, expect, it } from '@jest/globals';
import { expectRefusal } from '@ddd-ts-kit/testing';
import { Money } from '@/shared-kernel/money.vo';
import { ApplicationRequestService } from '@/contexts/credit-application/file/domain/services/application-request.service';

describe('ApplicationRequestService', () => {
  it('holds no state of its own', () => {
    expect(Object.keys(new ApplicationRequestService())).toEqual([]);
  });

  it('submits an application for a positive amount over a whole number of months', () => {
    const event = new ApplicationRequestService().submittedEventOf('application-1', 'applicant-1', {
      amount: Money.ofCents(1000000),
      durationMonths: 48,
      registeredAt: new Date('2026-01-05T10:00:00Z'),
      branchId: 'branch-1',
    });

    expect(event.durationMonths).toBe(48);
  });

  it('refuses an application for a zero amount', () => {
    expectRefusal(
      () =>
        new ApplicationRequestService().submittedEventOf('application-1', 'applicant-1', {
          amount: Money.ofCents(0),
          durationMonths: 48,
          registeredAt: new Date('2026-01-05T10:00:00Z'),
          branchId: 'branch-1',
        }),
      'INVALID_AMOUNT',
    );
  });

  it('refuses an application for a duration that is not a whole number of months', () => {
    expectRefusal(
      () =>
        new ApplicationRequestService().submittedEventOf('application-1', 'applicant-1', {
          amount: Money.ofCents(1000000),
          durationMonths: 0,
          registeredAt: new Date('2026-01-05T10:00:00Z'),
          branchId: 'branch-1',
        }),
      'INVALID_DURATION',
    );
  });
});
