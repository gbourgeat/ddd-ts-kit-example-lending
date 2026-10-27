import type { AuditStamp, TenantScoped } from '@ddd-ts-kit/kernel';
import { Portfolio } from '@/contexts/branch-network/domain/aggregates/portfolio.aggregate';
import type { BranchNetworkPortfolio as PortfolioRow } from '$generated/prisma/client';

export type PortfolioColumns = Omit<PortfolioRow, 'version' | keyof AuditStamp | keyof TenantScoped>;

export const PortfolioMapper = {
  toDomain(row: PortfolioRow): Portfolio {
    const loaded = Portfolio.rehydrate(row.id, {
      registeredAt: row.registeredAt,
      advisorId: row.advisorId,
      branchId: row.branchId,
    });

    loaded.version = row.version;

    return loaded;
  },

  toRow(saved: Portfolio): PortfolioColumns {
    return { id: saved.id, ...saved.toState() };
  },
};
