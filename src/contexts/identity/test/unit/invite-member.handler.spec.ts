import { describe, expect, it } from '@jest/globals';
import type { DomainEvent } from '@ddd-ts-kit/kernel';
import { InvitationIssued } from '@/contexts/identity/domain/events/invitation-issued.event';
import { MemberRight } from '@/contexts/identity/domain/vocabularies/member-right.vocabulary';
import { MemberRole } from '@/contexts/identity/domain/vocabularies/member-role.vocabulary';
import { InviteMemberCommand } from '@/contexts/identity/application/commands/invite-member/invite-member.command';
import { aDelegation } from '@/contexts/identity/test/builders/delegation.builder';
import { aMember } from '@/contexts/identity/test/builders/member.builder';
import { arrangeIdentity } from '@/contexts/identity/test/worlds/identity.world';

const grace = { email: 'grace@example.test', role: MemberRole.Member };

describe('Invite member', () => {
  it('issues the invitation and answers its token once, keeping only its digest', async () => {
    const { application, members, invitations, as } = arrangeIdentity();

    await members.save(aMember().of('acme', 'subject-ada').as(MemberRole.Admin).build());

    const issued = await application.commandBus.execute(new InviteMemberCommand(as('subject-ada'), 'acme', grace));
    const stored = await invitations.findById(issued.id);

    expect(issued.token).toBe('token-1');

    expect(stored?.toState()).toMatchObject({
      organisationId: 'acme',
      tokenHash: 'digest-of-token-1',
      invitedBy: 'subject-ada',
    });
  });

  it('lets a delegate invite with the right lent to them, in their own role, and names the delegation used', async () => {
    const { application, members, delegations, invitations, as } = arrangeIdentity();
    const now = application.clock.now();

    await members.save(aMember().of('acme', 'subject-grace').build());

    await delegations.save(
      aDelegation()
        .identifiedBy('delegation-1')
        .to('subject-grace')
        .lending(MemberRight.InviteMembers)
        .between(now, new Date(now.getTime() + 86_400_000))
        .build(),
    );

    const issued: DomainEvent[] = [];

    application.domainEvents.on(InvitationIssued.eventName, async (event) => {
      issued.push(event);
    });

    await expect(
      application.commandBus.execute(
        new InviteMemberCommand(as('subject-grace'), 'acme', { ...grace, email: 'alan@example.test' }),
      ),
    ).resolves.toMatchObject({ token: 'token-1' });

    expect(invitations.count()).toBe(1);
    expect(issued).toMatchObject([{ facts: { organisationId: 'acme', delegationId: 'delegation-1' } }]);
  });

  it('never lets a delegation lift whom a member invites above their own role', async () => {
    const { application, members, delegations, as } = arrangeIdentity();
    const now = application.clock.now();

    await members.save(aMember().of('acme', 'subject-grace').build());

    await delegations.save(
      aDelegation()
        .to('subject-grace')
        .lending(MemberRight.InviteMembers)
        .between(now, new Date(now.getTime() + 86_400_000))
        .build(),
    );

    await expect(
      application.commandBus.execute(
        new InviteMemberCommand(as('subject-grace'), 'acme', {
          email: 'grace.second@example.test',
          role: MemberRole.Admin,
        }),
      ),
    ).rejects.toMatchObject({ code: 'ABOVE_OWN_ROLE' });
  });

  it('is refused to a member whose role does not invite, and to a stranger to the organisation', async () => {
    const { application, members, invitations, as } = arrangeIdentity();

    await members.save(aMember().of('acme', 'subject-alan').as(MemberRole.Member).build());

    await expect(
      application.commandBus.execute(new InviteMemberCommand(as('subject-alan'), 'acme', grace)),
    ).rejects.toMatchObject({ code: 'FORBIDDEN' });

    await expect(
      application.commandBus.execute(new InviteMemberCommand(as('subject-mallory'), 'acme', grace)),
    ).rejects.toMatchObject({ code: 'FORBIDDEN' });

    expect(invitations.all()).toEqual([]);
  });

  it('lets an owner only invite an owner, and an admin no one above admin', async () => {
    const { application, members, as } = arrangeIdentity();

    await members.save(aMember().of('acme', 'subject-ada').as(MemberRole.Admin).build());

    await expect(
      application.commandBus.execute(
        new InviteMemberCommand(as('subject-ada'), 'acme', { ...grace, role: MemberRole.Owner }),
      ),
    ).rejects.toMatchObject({ code: 'OWNERS_ONLY' });
  });
});
