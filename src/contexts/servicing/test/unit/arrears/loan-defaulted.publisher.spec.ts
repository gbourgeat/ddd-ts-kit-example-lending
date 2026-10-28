import { describe, expect, it } from '@jest/globals';
import { InMemoryEventBus, SequentialIdGenerator } from '@ddd-ts-kit/kernel';
import { LoanDefaultedPublisher } from '@/contexts/servicing/arrears/application/integration/publishers/loan-defaulted.publisher';
import { LoanDefaulted } from '@/contexts/servicing/arrears/domain/events/loan-defaulted.event';

describe('Publishing "loan defaulted" to other contexts', () => {
  it('publishes version 1 of servicing.loan.defaulted', async () => {
    const bus = new InMemoryEventBus();
    const publisher = new LoanDefaultedPublisher(bus, new SequentialIdGenerator('event'));

    await publisher.handle(new LoanDefaulted('loan-1', new Date('2026-01-01T00:00:00.000Z')));

    expect(bus.published).toEqual([
      {
        id: 'event-1',
        type: 'servicing.loan.defaulted',
        version: 1,
        occurredAt: '2026-01-01T00:00:00.000Z',
        payload: { loanId: 'loan-1' },
      },
    ]);
  });
});
