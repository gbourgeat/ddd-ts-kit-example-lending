import { describe, expect, it } from '@jest/globals';
import { InMemoryEventBus, SequentialIdGenerator } from '@ddd-ts-kit/kernel';
import { CreditApplicationWithdrawnPublisher } from '@/contexts/credit-application/offer/application/integration/publishers/credit-application-withdrawn.publisher';
import { CreditApplicationWithdrawn } from '@/contexts/credit-application/offer/domain/events/credit-application-withdrawn.event';

describe('Publishing "credit application withdrawn" to other contexts', () => {
  it('publishes version 1 of credit-application.credit-application.withdrawn', async () => {
    const bus = new InMemoryEventBus();
    const publisher = new CreditApplicationWithdrawnPublisher(bus, new SequentialIdGenerator('event'));

    await publisher.handle(
      new CreditApplicationWithdrawn('credit-application-1', new Date('2026-01-01T00:00:00.000Z')),
    );

    expect(bus.published).toEqual([
      {
        id: 'event-1',
        type: 'credit-application.credit-application.withdrawn',
        version: 1,
        occurredAt: '2026-01-01T00:00:00.000Z',
        payload: { creditApplicationId: 'credit-application-1' },
      },
    ]);
  });
});
