import { describe, expect, it } from '@jest/globals';
import { offsetPage } from '@ddd-ts-kit/kernel';
import { MemberRole } from '@/contexts/identity/domain/vocabularies/member-role.vocabulary';
import { SearchMembersQuery } from '@/contexts/identity/application/queries/search-members/search-members.query';
import { aMember } from '@/contexts/identity/test/builders/member.builder';
import { arrangeIdentity } from '@/contexts/identity/test/worlds/identity.world';

const ada = {
  memberId: 'member-1',
  accountId: 'subject-ada',
  displayName: 'Ada Lovelace',
  email: 'ada@example.test',
  role: MemberRole.Owner,
  joinedAt: new Date('2026-01-01T00:00:00.000Z'),
};

describe('Search members', () => {
  it('answers a page of the members of the organisation to one of its members', async () => {
    const { application, members, reader, as } = arrangeIdentity();

    await members.save(aMember().of('acme', 'subject-ada').as(MemberRole.Owner).build());
    reader.given('acme', ada);

    const page = await application.queryBus.execute(
      new SearchMembersQuery(as('subject-ada'), 'acme', offsetPage({ limit: 20 })),
    );

    expect(page.items).toEqual([ada]);
  });

  it('answers nothing to a person who is not a member of the organisation', async () => {
    const { application, reader, as } = arrangeIdentity();

    reader.given('acme', ada);

    await expect(
      application.queryBus.execute(new SearchMembersQuery(as('subject-mallory'), 'acme', offsetPage({ limit: 20 }))),
    ).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });
});
