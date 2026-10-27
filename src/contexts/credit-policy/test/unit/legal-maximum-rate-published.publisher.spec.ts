import { describe, expect, it } from '@jest/globals';
import { InMemoryEventBus, SequentialIdGenerator } from '@ddd-ts-kit/kernel';
import { LegalMaximumRatePublishedPublisher } from '@/contexts/credit-policy/application/integration/publishers/legal-maximum-rate-published.publisher';
import { LegalMaximumRatePublished } from '@/contexts/credit-policy/domain/events/legal-maximum-rate-published.event';

describe('Publishing "legal maximum rate published" to other contexts', () => {
  it('publishes version 1 of credit-policy.legal-maximum-rate.published', async () => {
    const bus = new InMemoryEventBus();
    const publisher = new LegalMaximumRatePublishedPublisher(bus, new SequentialIdGenerator('event'));

    await publisher.handle(new LegalMaximumRatePublished('legal-maximum-rate-1', new Date('2026-01-01T00:00:00.000Z')));

    expect(bus.published).toEqual([
      {
        id: 'event-1',
        type: 'credit-policy.legal-maximum-rate.published',
        version: 1,
        occurredAt: '2026-01-01T00:00:00.000Z',
        payload: { legalMaximumRateId: 'legal-maximum-rate-1' },
      },
    ]);
  });

  it('publishes each one with its own identifier', async () => {
    const bus = new InMemoryEventBus();
    const publisher = new LegalMaximumRatePublishedPublisher(bus, new SequentialIdGenerator('event'));

    await publisher.handle(new LegalMaximumRatePublished('first-1', new Date('2026-01-01T00:00:00.000Z')));
    await publisher.handle(new LegalMaximumRatePublished('second-2', new Date('2026-01-01T00:00:00.000Z')));

    expect(bus.published.map((event) => event.payload)).toEqual([
      { legalMaximumRateId: 'first-1' },
      { legalMaximumRateId: 'second-2' },
    ]);
  });
});
