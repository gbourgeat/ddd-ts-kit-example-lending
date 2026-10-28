import { describe, expect, it } from '@jest/globals';
import { LoanPaymentReceived } from '@/contexts/servicing/instalments/domain/events/loan-payment-received.event';
import { Money } from '@/shared-kernel/money.vo';

describe('LoanPaymentReceived', () => {
  it('is named after the context, the aggregate and the fact', () => {
    const event = new LoanPaymentReceived('loan-1', new Date('2026-01-01T00:00:00.000Z'), 1, Money.ofCents(8_000));

    expect(event.name).toBe('servicing.loan.payment-received');
    expect(event.aggregateId).toBe('loan-1');
  });

  it('carries the number of the instalment and the money received', () => {
    const event = new LoanPaymentReceived('loan-1', new Date('2026-01-01T00:00:00.000Z'), 1, Money.ofCents(8_000));

    expect(event).toMatchObject({ number: 1, amount: { cents: 8_000 } });
  });
});
