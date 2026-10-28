import { describe, expect, it } from '@jest/globals';
import { InMemoryEventBus, SequentialIdGenerator } from '@ddd-ts-kit/kernel';
import { CreditApplicationDecidedPublisher } from '@/contexts/credit-application/decision/application/integration/publishers/credit-application-decided.publisher';
import { CreditApplicationDecided } from '@/contexts/credit-application/file/domain/events/credit-application-decided.event';

describe('Publishing "credit application decided" to other contexts', () => {
  it('publishes version 1 of credit-application.credit-application.decided', async () => {
    const bus = new InMemoryEventBus();
    const publisher = new CreditApplicationDecidedPublisher(bus, new SequentialIdGenerator('event'));

    await publisher.handle(aDecision());

    expect(bus.published).toEqual([
      {
        id: 'event-1',
        type: 'credit-application.credit-application.decided',
        version: 1,
        occurredAt: '2026-01-01T00:00:00.000Z',
        payload: {
          creditApplicationId: 'credit-application-1',
          outcome: 'approve',
          exception: false,
          branchId: 'branch-1',
          approvedAmountCents: 1_234_567,
        },
      },
    ]);
  });
});

function aDecision(): CreditApplicationDecided {
  const decidedAt = new Date('2026-01-01T00:00:00.000Z');

  return new CreditApplicationDecided(
    'credit-application-1',
    decidedAt,
    'approve',
    'staff-1',
    'advisor',
    '',
    '',
    1_234_567,
    'branch-1',
    false,
  );
}
