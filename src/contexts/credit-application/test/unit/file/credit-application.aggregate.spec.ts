import { describe, expect, it } from '@jest/globals';
import { givenEvents } from '@ddd-ts-kit/testing';
import { CreditApplication } from '@/contexts/credit-application/file/domain/aggregates/credit-application.aggregate';
import { CreditApplicationSubmitted } from '@/contexts/credit-application/file/domain/events/credit-application-submitted.event';

const bornAt = new Date('2026-03-01T00:00:00.000Z');

describe('CreditApplication', () => {
  it('records its submission, and holds the applicant and the day it was registered', () => {
    const born = CreditApplication.create('credit-application-7', 'customer-1', bornAt);

    expect(born.applicantId).toBe('customer-1');
    expect(born.registeredAt).toEqual(bornAt);
    expect(born.pullEvents()).toEqual([new CreditApplicationSubmitted('credit-application-7', 'customer-1', bornAt)]);
  });

  it('is rebuilt from its history, recording nothing', () => {
    givenEvents(
      (id, history) => CreditApplication.rehydrate(id, history),
      [new CreditApplicationSubmitted('credit-application-7', 'customer-1', bornAt)],
    )
      .when((loaded) => loaded.toState())
      .thenNoEvent()
      .thenState((loaded) => expect(loaded.version).toBe(1));
  });
});
