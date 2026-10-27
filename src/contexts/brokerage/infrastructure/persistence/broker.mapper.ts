import type { AuditStamp, TenantScoped } from '@ddd-ts-kit/kernel';
import { Broker } from '@/contexts/brokerage/domain/aggregates/broker.aggregate';
import type { BrokerageBroker as BrokerRow } from '$generated/prisma/client';

export type BrokerColumns = Omit<BrokerRow, 'version' | keyof AuditStamp | keyof TenantScoped>;

export const BrokerMapper = {
  toDomain(row: BrokerRow): Broker {
    const loaded = Broker.rehydrate(row.id, {
      registeredAt: row.registeredAt,
      registrationNumber: row.registrationNumber,
    });

    loaded.version = row.version;

    return loaded;
  },

  toRow(saved: Broker): BrokerColumns {
    return { id: saved.id, ...saved.toState() };
  },
};
