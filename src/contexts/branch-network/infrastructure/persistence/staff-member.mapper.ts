import type { AuditStamp, TenantScoped } from '@ddd-ts-kit/kernel';
import { StaffMember } from '@/contexts/branch-network/domain/aggregates/staff-member.aggregate';
import type { BranchNetworkStaffMember as StaffMemberRow } from '$generated/prisma/client';

export type StaffMemberColumns = Omit<StaffMemberRow, 'version' | keyof AuditStamp | keyof TenantScoped>;

export const StaffMemberMapper = {
  toDomain(row: StaffMemberRow): StaffMember {
    const loaded = StaffMember.rehydrate(row.id, {
      registeredAt: row.registeredAt,
      name: row.name,
      email: row.email,
    });

    loaded.version = row.version;

    return loaded;
  },

  toRow(saved: StaffMember): StaffMemberColumns {
    return { id: saved.id, ...saved.toState() };
  },
};
