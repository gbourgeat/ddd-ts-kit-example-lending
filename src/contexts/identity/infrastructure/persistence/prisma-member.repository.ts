import { optimisticUpdate } from '@ddd-ts-kit/prisma';
import { stampCreation, stampUpdate, type Clock, type ExecutionScope } from '@ddd-ts-kit/kernel';
import type { Member } from '@/contexts/identity/domain/aggregates/member.aggregate';
import type { MemberRepository } from '@/contexts/identity/domain/repositories/member.repository';
import { MemberRole } from '@/contexts/identity/domain/vocabularies/member-role.vocabulary';
import type { Database } from '@/platform/database/database';
import { MemberMapper, type MemberColumns } from '@/contexts/identity/infrastructure/persistence/member.mapper';

type VersionedMember = MemberColumns & { readonly version: number };

export class PrismaMemberRepository implements MemberRepository {
  constructor(
    private readonly database: Database,
    private readonly scope: ExecutionScope,
    private readonly clock: Clock,
  ) {}

  async findById(id: string): Promise<Member | undefined> {
    const row = await membersOf(this.database).findUnique({ where: { id } });

    return row === null ? undefined : MemberMapper.toDomain(row);
  }

  async findOf(organisationId: string, accountId: string): Promise<Member | undefined> {
    const row = await membersOf(this.database).findFirst({ where: { organisationId, accountId, removedAt: null } });

    return row === null ? undefined : MemberMapper.toDomain(row);
  }

  async searchCurrentOf(accountId: string): Promise<readonly Member[]> {
    const rows = await membersOf(this.database).findMany({
      where: { accountId, removedAt: null },
      orderBy: { id: 'asc' },
    });

    return rows.map((row) => MemberMapper.toDomain(row));
  }

  countOwners(organisationId: string): Promise<number> {
    return membersOf(this.database).count({ where: { organisationId, role: MemberRole.Owner, removedAt: null } });
  }

  async save(saved: Member): Promise<void> {
    await optimisticUpdate(saved, async ({ expected, next }) => {
      const state = { ...MemberMapper.toRow(saved), version: next };
      const written = expected === 0 ? await this.insert(state) : await this.update(state, expected);

      return written.count;
    });
  }

  private insert(state: VersionedMember): Promise<{ count: number }> {
    const row = { ...state, ...stampCreation(this.scope, this.clock) };

    return membersOf(this.database).createMany({ data: [row], skipDuplicates: true });
  }

  private update(state: VersionedMember, expected: number): Promise<{ count: number }> {
    return membersOf(this.database).updateMany({
      where: { id: state.id, version: expected },
      data: { ...state, ...stampUpdate(this.scope, this.clock) },
    });
  }
}

/** The members on the client of the unit of work, which every statement of this file goes through. */
function membersOf(database: Database): ReturnType<Database['client']>['identityMember'] {
  // ddd-ts-kit-disable-next-line tenancy/scoped-statement -- ADR-0001: the identity context is the control plane of the tenants, and its rows belong to none of them.
  return database.client().identityMember;
}
