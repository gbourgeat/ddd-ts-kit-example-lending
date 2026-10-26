import { describe, expect, it } from '@jest/globals';
import { OrganisationRights } from '@/contexts/identity/domain/value-objects/organisation-rights.vo';
import { MemberRight } from '@/contexts/identity/domain/vocabularies/member-right.vocabulary';

describe('OrganisationRights', () => {
  it('holds each right once, whatever gave it twice', () => {
    const rights = OrganisationRights.of('acme', 'account-ada', [
      MemberRight.ReadMembers,
      MemberRight.InviteMembers,
      MemberRight.ReadMembers,
    ]);

    expect(rights.rights).toEqual([MemberRight.InviteMembers, MemberRight.ReadMembers]);
    expect(rights.includes(MemberRight.InviteMembers)).toBe(true);
    expect(rights.includes(MemberRight.ManageMembers)).toBe(false);
  });

  it('names the context as the resource the platform authorizes, for the account and the organisation it holds in', () => {
    const rights = OrganisationRights.of('acme', 'account-ada', []);

    expect(rights).toMatchObject({ type: 'context', id: 'identity', organisationId: 'acme', accountId: 'account-ada' });
  });
});
