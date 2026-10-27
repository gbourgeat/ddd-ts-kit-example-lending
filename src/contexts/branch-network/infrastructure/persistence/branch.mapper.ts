import type { AuditStamp, TenantScoped } from '@ddd-ts-kit/kernel';
import { Branch } from '@/contexts/branch-network/domain/aggregates/branch.aggregate';
import type { BranchNetworkBranch as BranchRow } from '$generated/prisma/client';

export type BranchColumns = Omit<BranchRow, 'version' | keyof AuditStamp | keyof TenantScoped>;

export const BranchMapper = {
  toDomain(row: BranchRow): Branch {
    const loaded = Branch.rehydrate(row.id, { registeredAt: row.registeredAt });

    loaded.version = row.version;

    return loaded;
  },

  toRow(saved: Branch): BranchColumns {
    return { id: saved.id, ...saved.toState() };
  },
};
