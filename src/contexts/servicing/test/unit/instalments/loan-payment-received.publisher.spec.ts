import { describe, expect, it } from '@jest/globals';
import { InMemoryEventBus, SequentialIdGenerator } from '@ddd-ts-kit/kernel';
import { LoanPaymentReceivedPublisher } from '@/contexts/servicing/instalments/application/integration/publishers/loan-payment-received.publisher';
import { Money } from '@/shared-kernel/money.vo';
import { LoanPaymentReceived } from '@/contexts/servicing/instalments/domain/events/loan-payment-received.event';

describe('Publishing "loan payment received" to other contexts', () => {
  it('publishes version 1 of servicing.loan.payment-received', async () => {
    const bus = new InMemoryEventBus();
    const publisher = new LoanPaymentReceivedPublisher(bus, new SequentialIdGenerator('event'));

    await publisher.handle(
      new LoanPaymentReceived('loan-1', new Date('2026-01-01T00:00:00.000Z'), 3, Money.ofCents(19_286)),
    );

    expect(bus.published).toEqual([
      {
        id: 'event-1',
        type: 'servicing.loan.payment-received',
        version: 1,
        occurredAt: '2026-01-01T00:00:00.000Z',
        payload: { loanId: 'loan-1', instalmentNumber: 3, amountCents: 19_286 },
      },
    ]);
  });
});
