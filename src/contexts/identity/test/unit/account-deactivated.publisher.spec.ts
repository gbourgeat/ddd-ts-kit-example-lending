import { describe, expect, it } from '@jest/globals';
import { InMemoryEventBus, SequentialIdGenerator } from '@ddd-ts-kit/kernel';
import { AccountDeactivatedPublisher } from '@/contexts/identity/application/integration/publishers/account-deactivated.publisher';
import { AccountDeactivated } from '@/contexts/identity/domain/events/account-deactivated.event';

const at = new Date('2026-01-01T00:00:00.000Z');

describe('Publishing "account deactivated" to other contexts', () => {
  it('publishes version 1 of identity.account.deactivated, every field of its payload', async () => {
    const bus = new InMemoryEventBus();
    const publisher = new AccountDeactivatedPublisher(bus, new SequentialIdGenerator('event'));

    await publisher.handle(new AccountDeactivated('subject-ada', at));

    expect(bus.published).toMatchObject([
      {
        id: 'event-1',
        type: 'identity.account.deactivated',
        version: 1,
        occurredAt: '2026-01-01T00:00:00.000Z',
        payload: { accountId: 'subject-ada' },
      },
    ]);
  });
});
