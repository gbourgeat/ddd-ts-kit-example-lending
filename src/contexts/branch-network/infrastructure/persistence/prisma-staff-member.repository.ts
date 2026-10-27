import { stampCreation, stampUpdate, tenantScopeOf, type Clock, type ExecutionScope } from '@ddd-ts-kit/kernel';
import { optimisticUpdate, ownTenantWhere, tenantWhere } from '@ddd-ts-kit/prisma';
import type { StaffMember } from '@/contexts/branch-network/domain/aggregates/staff-member.aggregate';
import type { StaffMemberRepository } from '@/contexts/branch-network/domain/repositories/staff-member.repository';
import type { Database } from '@/platform/database/database';
import {
  StaffMemberMapper,
  type StaffMemberColumns,
} from '@/contexts/branch-network/infrastructure/persistence/staff-member.mapper';

type VersionedStaffMember = StaffMemberColumns & { readonly version: number };

export class PrismaStaffMemberRepository implements StaffMemberRepository {
  constructor(
    private readonly database: Database,
    private readonly scope: ExecutionScope,
    private readonly clock: Clock,
  ) {}

  async findById(id: string): Promise<StaffMember | undefined> {
    // findFirst, not findUnique: the tenant is part of every condition, and it is not part of the key.
    const row = await this.database.client().branchNetworkStaffMember.findFirst({
      where: { id, ...tenantWhere(this.scope) },
    });

    return row === null ? undefined : StaffMemberMapper.toDomain(row);
  }

  async save(saved: StaffMember): Promise<void> {
    await optimisticUpdate(saved, async ({ expected, next }) => {
      const state = { ...StaffMemberMapper.toRow(saved), version: next };
      const written = expected === 0 ? await this.insert(state) : await this.update(state, expected);

      return written.count;
    });
  }

  /** The row is written in the tenant of the work: `tenantScopeOf` names it, `tenantWhere` finds it again. */
  private insert(state: VersionedStaffMember): Promise<{ count: number }> {
    const row = { ...state, ...tenantScopeOf(this.scope), ...stampCreation(this.scope, this.clock) };

    return this.database.client().branchNetworkStaffMember.createMany({ data: [row], skipDuplicates: true });
  }

  private update(state: VersionedStaffMember, expected: number): Promise<{ count: number }> {
    return this.database.client().branchNetworkStaffMember.updateMany({
      where: { id: state.id, version: expected, ...ownTenantWhere(this.scope) },
      data: { ...state, ...stampUpdate(this.scope, this.clock) },
    });
  }
}
