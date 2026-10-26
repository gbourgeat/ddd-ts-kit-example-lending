import { describe, expect, it } from '@jest/globals';
import { MemberRole } from '@/contexts/identity/domain/vocabularies/member-role.vocabulary';
import { RevokeDelegationCommand } from '@/contexts/identity/application/commands/revoke-delegation/revoke-delegation.command';
import { aDelegation } from '@/contexts/identity/test/builders/delegation.builder';
import { aMember } from '@/contexts/identity/test/builders/member.builder';
import { arrangeIdentity } from '@/contexts/identity/test/worlds/identity.world';

describe('Revoke delegation', () => {
  it('ends a delegation of the organisation while it holds, and tells the other contexts', async () => {
    const { application, members, delegations, as } = arrangeIdentity();
    const now = application.clock.now();

    await members.save(aMember().of('acme', 'subject-ada').as(MemberRole.Owner).build());

    await delegations.save(
      aDelegation()
        .identifiedBy('delegation-1')
        .between(now, new Date(now.getTime() + 86_400_000))
        .build(),
    );

    const before = application.eventBus.published.length;

    await application.commandBus.execute(new RevokeDelegationCommand(as('subject-ada'), 'acme', 'delegation-1'));

    expect((await delegations.findById('delegation-1'))?.isActiveAt(now)).toBe(false);
    expect(application.eventBus.published.slice(before)).toMatchObject([{ type: 'identity.delegation.revoked' }]);
  });

  it('finds no delegation of another organisation', async () => {
    const { application, members, delegations, as } = arrangeIdentity();

    await members.save(aMember().of('acme', 'subject-ada').as(MemberRole.Owner).build());
    await delegations.save(aDelegation().identifiedBy('delegation-1').in('globex').build());

    await expect(
      application.commandBus.execute(new RevokeDelegationCommand(as('subject-ada'), 'acme', 'delegation-1')),
    ).rejects.toMatchObject({ code: 'DELEGATION_NOT_FOUND' });
  });

  it('is refused to a member whose role does not delegate', async () => {
    const { application, members, delegations, as } = arrangeIdentity();

    await members.save(aMember().of('acme', 'subject-alan').build());
    await delegations.save(aDelegation().identifiedBy('delegation-1').build());

    await expect(
      application.commandBus.execute(new RevokeDelegationCommand(as('subject-alan'), 'acme', 'delegation-1')),
    ).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });
});
