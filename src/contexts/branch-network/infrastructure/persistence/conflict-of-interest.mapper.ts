import type { AuditStamp, TenantScoped } from '@ddd-ts-kit/kernel';
import { ConflictOfInterest } from '@/contexts/branch-network/domain/aggregates/conflict-of-interest.aggregate';
import type { BranchNetworkConflictOfInterest as ConflictOfInterestRow } from '$generated/prisma/client';

export type ConflictOfInterestColumns = Omit<ConflictOfInterestRow, 'version' | keyof AuditStamp | keyof TenantScoped>;

export const ConflictOfInterestMapper = {
  toDomain(row: ConflictOfInterestRow): ConflictOfInterest {
    const loaded = ConflictOfInterest.rehydrate(row.id, {
      registeredAt: row.registeredAt,
      staffMemberId: row.staffMemberId,
      customerId: row.customerId,
    });

    loaded.version = row.version;

    return loaded;
  },

  toRow(saved: ConflictOfInterest): ConflictOfInterestColumns {
    return { id: saved.id, ...saved.toState() };
  },
};
