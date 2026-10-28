import { describe, expect, it } from '@jest/globals';
import { InMemoryEventBus, SequentialIdGenerator } from '@ddd-ts-kit/kernel';
import { LoanPaidOutPublisher } from '@/contexts/servicing/ledger/application/integration/publishers/loan-paid-out.publisher';
import { LoanPaidOut } from '@/contexts/servicing/ledger/domain/events/loan-paid-out.event';

describe('Publishing "loan paid out" to other contexts', () => {
  it('publishes version 1 of servicing.loan.paid-out', async () => {
    const bus = new InMemoryEventBus();
    const publisher = new LoanPaidOutPublisher(bus, new SequentialIdGenerator('event'));

    await publisher.handle(new LoanPaidOut('loan-1', new Date('2026-01-01T00:00:00.000Z')));

    expect(bus.published).toEqual([
      {
        id: 'event-1',
        type: 'servicing.loan.paid-out',
        version: 1,
        occurredAt: '2026-01-01T00:00:00.000Z',
        payload: { loanId: 'loan-1' },
      },
    ]);
  });
});
