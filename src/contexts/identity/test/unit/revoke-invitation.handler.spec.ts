import { describe, expect, it } from '@jest/globals';
import { InvitationStatus } from '@/contexts/identity/domain/vocabularies/invitation-status.vocabulary';
import { MemberRole } from '@/contexts/identity/domain/vocabularies/member-role.vocabulary';
import { RevokeInvitationCommand } from '@/contexts/identity/application/commands/revoke-invitation/revoke-invitation.command';
import { anInvitation } from '@/contexts/identity/test/builders/invitation.builder';
import { aMember } from '@/contexts/identity/test/builders/member.builder';
import { arrangeIdentity } from '@/contexts/identity/test/worlds/identity.world';

describe('Revoke invitation', () => {
  it('takes back an invitation of the organisation', async () => {
    const { application, members, invitations, as } = arrangeIdentity();

    await members.save(aMember().of('acme', 'subject-ada').as(MemberRole.Admin).build());
    await invitations.save(anInvitation().identifiedBy('invitation-1').to('acme').build());

    await application.commandBus.execute(new RevokeInvitationCommand(as('subject-ada'), 'acme', 'invitation-1'));

    expect((await invitations.findById('invitation-1'))?.status).toBe(InvitationStatus.Revoked);
  });

  it('finds no invitation of another organisation, and none that does not exist', async () => {
    const { application, members, invitations, as } = arrangeIdentity();

    await members.save(aMember().of('acme', 'subject-ada').as(MemberRole.Admin).build());
    await invitations.save(anInvitation().identifiedBy('invitation-1').to('globex').build());

    await expect(
      application.commandBus.execute(new RevokeInvitationCommand(as('subject-ada'), 'acme', 'invitation-1')),
    ).rejects.toMatchObject({ code: 'INVITATION_NOT_FOUND' });

    await expect(
      application.commandBus.execute(new RevokeInvitationCommand(as('subject-ada'), 'acme', 'invitation-9')),
    ).rejects.toMatchObject({ code: 'INVITATION_NOT_FOUND' });
  });

  it('is refused to a member whose role does not invite', async () => {
    const { application, members, invitations, as } = arrangeIdentity();

    await members.save(aMember().of('acme', 'subject-alan').build());
    await invitations.save(anInvitation().identifiedBy('invitation-1').to('acme').build());

    await expect(
      application.commandBus.execute(new RevokeInvitationCommand(as('subject-alan'), 'acme', 'invitation-1')),
    ).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });
});
