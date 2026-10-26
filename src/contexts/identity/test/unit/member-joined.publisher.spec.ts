import { describe, expect, it } from '@jest/globals';
import { InMemoryEventBus, SequentialIdGenerator } from '@ddd-ts-kit/kernel';
import { MemberJoinedPublisher } from '@/contexts/identity/application/integration/publishers/member-joined.publisher';
import { MemberJoined } from '@/contexts/identity/domain/events/member-joined.event';
import { MemberRole } from '@/contexts/identity/domain/vocabularies/member-role.vocabulary';

const at = new Date('2026-01-01T00:00:00.000Z');

describe('Publishing "member joined" to other contexts', () => {
  it('publishes version 1 of identity.member.joined, every field of its payload', async () => {
    const bus = new InMemoryEventBus();
    const publisher = new MemberJoinedPublisher(bus, new SequentialIdGenerator('event'));

    await publisher.handle(
      new MemberJoined('member-1', at, { organisationId: 'acme', accountId: 'subject-ada', role: MemberRole.Admin }),
    );

    expect(bus.published).toMatchObject([
      {
        id: 'event-1',
        type: 'identity.member.joined',
        version: 1,
        occurredAt: '2026-01-01T00:00:00.000Z',
        payload: { memberId: 'member-1', organisationId: 'acme', accountId: 'subject-ada', role: 'admin' },
      },
    ]);
  });

  it('names the organisation as the tenant of the fact, so that its consumers run in it', async () => {
    const bus = new InMemoryEventBus();

    await new MemberJoinedPublisher(bus, new SequentialIdGenerator('event')).handle(
      new MemberJoined('member-1', at, { organisationId: 'acme', accountId: 'subject-ada', role: MemberRole.Admin }),
    );

    expect(bus.published[0]?.tenantId).toBe('acme');
  });
});
