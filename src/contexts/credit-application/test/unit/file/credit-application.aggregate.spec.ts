import { describe, expect, it } from '@jest/globals';
import { expectRefusal, givenEvents } from '@ddd-ts-kit/testing';
import { Money } from '@/shared-kernel/money.vo';
import { CreditApplication } from '@/contexts/credit-application/file/domain/aggregates/credit-application.aggregate';
import { CreditApplicationSubmitted } from '@/contexts/credit-application/file/domain/events/credit-application-submitted.event';
import { aCreditApplication } from '@/contexts/credit-application/test/builders/credit-application.builder';

const bornAt = new Date('2026-03-01T00:00:00.000Z');
const request = { amount: Money.ofCents(1234567), durationMonths: 60, registeredAt: bornAt };

describe('CreditApplication', () => {
  it('records its submission, and holds the applicant, the requested amount, the duration and the day it was registered', () => {
    const born = CreditApplication.create('credit-application-7', 'customer-1', request);

    expect(born.applicantId).toBe('customer-1');
    expect(born.amount).toEqual(Money.ofCents(1234567));
    expect(born.durationMonths).toBe(60);
    expect(born.registeredAt).toEqual(bornAt);

    expect(born.pullEvents()).toEqual([
      new CreditApplicationSubmitted('credit-application-7', 'customer-1', Money.ofCents(1234567), 60, bornAt),
    ]);
  });

  it.each([0, -5])('refuses a requested amount of %p cents as INVALID_AMOUNT, recording nothing', (cents) => {
    const refused = () =>
      CreditApplication.create('credit-application-7', 'customer-1', { ...request, amount: Money.ofCents(cents) });

    expectRefusal(refused, 'INVALID_AMOUNT');
  });

  it.each([0, -3, 1.5])('refuses a duration of %p months as INVALID_DURATION, recording nothing', (months) => {
    const refused = () =>
      CreditApplication.create('credit-application-7', 'customer-1', { ...request, durationMonths: months });

    expectRefusal(refused, 'INVALID_DURATION');
  });

  it('is rebuilt from its history, recording nothing', () => {
    givenEvents(
      (id, history) => CreditApplication.rehydrate(id, history),
      [new CreditApplicationSubmitted('credit-application-7', 'customer-1', Money.ofCents(1234567), 60, bornAt)],
    )
      .when((loaded) => loaded.toState())
      .thenNoEvent()
      .thenState((loaded) => expect(loaded.version).toBe(1));
  });

  it('is built by the builder with the applicant it was submitted by', () => {
    const built = aCreditApplication().submittedBy('customer-2').build();

    expect(built.applicantId).toBe('customer-2');
  });
});
