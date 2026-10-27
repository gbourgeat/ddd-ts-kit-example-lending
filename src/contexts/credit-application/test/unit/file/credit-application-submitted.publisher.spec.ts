import { describe, expect, it } from '@jest/globals';
import { InMemoryEventBus, SequentialIdGenerator } from '@ddd-ts-kit/kernel';
import { CreditApplicationSubmittedPublisher } from '@/contexts/credit-application/file/application/integration/publishers/credit-application-submitted.publisher';
import { CreditApplicationSubmitted } from '@/contexts/credit-application/file/domain/events/credit-application-submitted.event';
import { Money } from '@/shared-kernel/money.vo';

describe('Publishing "credit application submitted" to other contexts', () => {
  it('publishes version 1 of credit-application.credit-application.submitted', async () => {
    const bus = new InMemoryEventBus();
    const publisher = new CreditApplicationSubmittedPublisher(bus, new SequentialIdGenerator('event'));

    await publisher.handle(
      new CreditApplicationSubmitted(
        'credit-application-1',
        'customer-1',
        Money.ofCents(1234567),
        60,
        new Date('2026-01-01T00:00:00.000Z'),
      ),
    );

    expect(bus.published).toEqual([
      {
        id: 'event-1',
        type: 'credit-application.credit-application.submitted',
        version: 1,
        occurredAt: '2026-01-01T00:00:00.000Z',
        payload: {
          creditApplicationId: 'credit-application-1',
          applicantId: 'customer-1',
          requestedAmountCents: 1234567,
          durationMonths: 60,
        },
      },
    ]);
  });
});
