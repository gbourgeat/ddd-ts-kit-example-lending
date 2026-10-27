import { InvalidPageRequestError, pageOf, type PageRequest } from '@ddd-ts-kit/kernel';
import type { SearchMembersReader } from '@/contexts/identity/application/ports/search-members-reader.port';
import type {
  SearchMembersItem,
  SearchMembersResult,
  SearchMembersSort,
} from '@/contexts/identity/application/queries/search-members/search-members.result';
import type { Database } from '@/platform/database/database';
import type { IdentityAccount as AccountRow, IdentityMember as MemberRow } from '$generated/prisma/client';

/**
 * The current members of an organisation with the profile of their account: the page applied by
 * the database, then the accounts of that page read in one statement, since the models of the
 * context hold no relation.
 */
export class PrismaSearchMembersReader implements SearchMembersReader {
  constructor(private readonly database: Database) {}

  async search(organisationId: string, page: PageRequest<SearchMembersSort>): Promise<SearchMembersResult> {
    if (page.kind !== 'offset') {
      throw new InvalidPageRequestError('The members of an organisation are read by offset');
    }

    const direction = page.sort[0]?.direction === 'desc' ? 'desc' : 'asc';
    const client = clientOf(this.database);
    const current = { organisationId, removedAt: null };

    const members = await client.identityMember.findMany({
      where: current,
      orderBy: [{ joinedAt: direction }, { id: direction }],
      take: page.limit,
      skip: page.offset,
    });

    const accounts = await client.identityAccount.findMany({
      where: { id: { in: members.map((member) => member.accountId) } },
    });

    const total = await client.identityMember.count({ where: current });

    return pageOf(withProfiles(members, accounts), { total });
  }
}

/** Each member of the page with the profile of its account, in the order of the page. */
function withProfiles(members: readonly MemberRow[], accounts: readonly AccountRow[]): SearchMembersItem[] {
  return members.flatMap((member) => {
    const account = accounts.find((candidate) => candidate.id === member.accountId);

    return account === undefined
      ? []
      : [
          {
            memberId: member.id,
            accountId: member.accountId,
            displayName: account.displayName,
            email: account.email,
            role: member.role,
            joinedAt: member.joinedAt,
          },
        ];
  });
}

/** The client of the unit of work, which every statement of this file goes through. */
function clientOf(database: Database): ReturnType<Database['client']> {
  return database.client();
}
