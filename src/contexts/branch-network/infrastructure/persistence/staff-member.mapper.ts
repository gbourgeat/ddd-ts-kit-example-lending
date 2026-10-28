import type { AuditStamp, TenantScoped } from '@ddd-ts-kit/kernel';
import { StaffMember } from '@/contexts/branch-network/domain/aggregates/staff-member.aggregate';
import type { BranchNetworkStaffMember as StaffMemberRow } from '$generated/prisma/client';

export type StaffMemberColumns = Omit<StaffMemberRow, 'version' | keyof AuditStamp | keyof TenantScoped>;

export const StaffMemberMapper = {
  toDomain(row: StaffMemberRow): StaffMember {
    const loaded = StaffMember.rehydrate(row.id, {
      registeredAt: row.registeredAt,
      branchId: row.branchId,
      name: row.name,
      email: row.email,
      accountId: row.accountId,
      level: row.level,
      ownCustomerId: row.ownCustomerId ?? undefined,
    });

    loaded.version = row.version;

    return loaded;
  },

  toRow(saved: StaffMember): StaffMemberColumns {
    const { ownCustomerId, ...state } = saved.toState();

    return { id: saved.id, ...state, ownCustomerId: ownCustomerId ?? null };
  },
};
