import { describe, expect, it } from '@jest/globals';
import { InvitationStatus } from '@/contexts/identity/domain/vocabularies/invitation-status.vocabulary';
import { DeclineInvitationCommand } from '@/contexts/identity/application/commands/decline-invitation/decline-invitation.command';
import { anAccount } from '@/contexts/identity/test/builders/account.builder';
import { anInvitation } from '@/contexts/identity/test/builders/invitation.builder';
import { arrangeIdentity } from '@/contexts/identity/test/worlds/identity.world';

describe('Decline invitation', () => {
  it('records the answer of the person it was sent to, who joins nothing', async () => {
    const { application, accounts, invitations, members, tokens, as } = arrangeIdentity();
    const token = tokens.issue();

    await accounts.save(anAccount().identifiedBy('subject-grace').reachedAt('grace@example.test').build());
    await invitations.save(anInvitation().identifiedBy('invitation-1').withTokenHash(token.digest).build());

    await application.commandBus.execute(new DeclineInvitationCommand(as('subject-grace'), token.token));

    expect((await invitations.findById('invitation-1'))?.status).toBe(InvitationStatus.Declined);
    expect(members.all()).toEqual([]);
  });

  it('knows no token it did not issue, and no person who never signed in', async () => {
    const { application, invitations, tokens, as } = arrangeIdentity();
    const token = tokens.issue();

    await invitations.save(anInvitation().withTokenHash(token.digest).build());

    await expect(
      application.commandBus.execute(new DeclineInvitationCommand(as('subject-grace'), 'forged')),
    ).rejects.toMatchObject({
      code: 'INVITATION_NOT_FOUND',
    });

    await expect(
      application.commandBus.execute(new DeclineInvitationCommand(as('subject-ghost'), token.token)),
    ).rejects.toMatchObject({
      code: 'ACCOUNT_NOT_FOUND',
    });
  });
});
