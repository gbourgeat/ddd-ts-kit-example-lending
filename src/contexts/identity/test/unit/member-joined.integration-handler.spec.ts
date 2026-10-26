import { describe, expect, it } from '@jest/globals';
import { MemberRole } from '@/contexts/identity/domain/vocabularies/member-role.vocabulary';
import { memberJoinedV1 } from '@/contexts/identity/published-language/member-joined.v1.integration-event';
import { aMember } from '@/contexts/identity/test/builders/member.builder';
import { arrangeIdentity } from '@/contexts/identity/test/worlds/identity.world';

const joining = memberJoinedV1.create(
  { memberId: 'member-1', organisationId: 'acme', accountId: 'subject-grace', role: MemberRole.Member },
  { id: 'event-1', occurredAt: '2026-01-01T00:00:00.000Z' },
);

describe('When a member joins, the identity provider follows', () => {
  it('adds the person to the organisation while the membership holds, once, and again after a failure', async () => {
    const { application, members, identityProvider } = arrangeIdentity();

    await members.save(aMember().of('acme', 'subject-grace').build());
    await application.start();
    const outage = new Error('provider unreachable');

    identityProvider.failWith(outage);

    await expect(application.eventBus.publish([joining])).rejects.toBe(outage);

    identityProvider.answerAgain();
    await application.eventBus.publish([joining]);
    await application.eventBus.publish([joining]);

    expect(identityProvider.asked).toEqual(['add subject-grace to acme']);
  });

  it('takes the person out when the membership ended before a late delivery: a removal is never undone by a retry', async () => {
    const { application, members, identityProvider } = arrangeIdentity();

    await members.save(aMember().of('acme', 'subject-grace').removedAt(new Date('2026-01-01T00:00:00.000Z')).build());
    await application.start();
    await application.eventBus.publish([joining]);

    expect(identityProvider.asked).toEqual(['remove subject-grace from acme']);
  });
});
