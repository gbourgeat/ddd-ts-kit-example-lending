import { describe, expect, it } from '@jest/globals';
import { InMemoryEventBus, SequentialIdGenerator } from '@ddd-ts-kit/kernel';
import { CreditApplicationRescheduleDecidedPublisher } from '@/contexts/credit-application/decision/application/integration/publishers/credit-application-reschedule-decided.publisher';
import { CreditApplicationRescheduleDecided } from '@/contexts/credit-application/decision/domain/events/credit-application-reschedule-decided.event';

describe('Publishing "credit application reschedule decided" to other contexts', () => {
  it('publishes version 1 of credit-application.credit-application.reschedule-decided', async () => {
    const bus = new InMemoryEventBus();
    const publisher = new CreditApplicationRescheduleDecidedPublisher(bus, new SequentialIdGenerator('event'));

    await publisher.handle(
      new CreditApplicationRescheduleDecided(
        'credit-application-1',
        new Date('2026-01-01T00:00:00.000Z'),
        'decider-1',
        'risk-manager',
        48,
        1_200_000,
      ),
    );

    expect(bus.published).toEqual([
      {
        id: 'event-1',
        type: 'credit-application.credit-application.reschedule-decided',
        version: 1,
        occurredAt: '2026-01-01T00:00:00.000Z',
        payload: { creditApplicationId: 'credit-application-1', durationMonths: 48, outstandingAmountCents: 1_200_000 },
      },
    ]);
  });
});
