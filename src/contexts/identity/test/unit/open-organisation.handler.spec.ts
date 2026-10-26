import { describe, expect, it } from '@jest/globals';
import { MemberRole } from '@/contexts/identity/domain/vocabularies/member-role.vocabulary';
import { OpenOrganisationCommand } from '@/contexts/identity/application/commands/open-organisation/open-organisation.command';
import { anAccount } from '@/contexts/identity/test/builders/account.builder';
import { anOrganisation } from '@/contexts/identity/test/builders/organisation.builder';
import { arrangeIdentity, startedIdentity } from '@/contexts/identity/test/worlds/identity.world';

const acme = { slug: 'acme', name: 'Acme' };

describe('Open organisation', () => {
  it('opens the organisation under its slug, its opener its first owner, and tells the provider and the other contexts', async () => {
    const { application, accounts, members, identityProvider, as } = await startedIdentity();

    await accounts.save(anAccount().identifiedBy('subject-ada').build());

    const id = await application.commandBus.execute(new OpenOrganisationCommand(as('subject-ada'), acme));

    expect(id).toBe('acme');
    expect((await members.findOf('acme', 'subject-ada'))?.role).toBe(MemberRole.Owner);
    expect(identityProvider.asked).toEqual(['open acme named Acme', 'add subject-ada to acme']);

    expect(application.eventBus.published.map((event) => event.type)).toEqual([
      'identity.organisation.opened',
      'identity.member.joined',
    ]);
  });

  it('refuses a slug another organisation holds, and saves nothing', async () => {
    const { application, accounts, organisations, members, as } = arrangeIdentity();

    await accounts.save(anAccount().identifiedBy('subject-ada').build());
    await organisations.save(anOrganisation().identifiedBy('acme').build());

    await expect(
      application.commandBus.execute(new OpenOrganisationCommand(as('subject-ada'), acme)),
    ).rejects.toMatchObject({
      code: 'ORGANISATION_SLUG_TAKEN',
    });

    expect(members.all()).toEqual([]);
  });

  it('refuses a person who never signed in', async () => {
    const { application, as } = arrangeIdentity();

    await expect(
      application.commandBus.execute(new OpenOrganisationCommand(as('subject-ghost'), acme)),
    ).rejects.toMatchObject({
      code: 'ACCOUNT_NOT_FOUND',
    });
  });
});
