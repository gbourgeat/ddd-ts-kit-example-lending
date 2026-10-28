import { PrismaReadModelStore } from '@ddd-ts-kit/prisma';
import type { ExecutionScope } from '@ddd-ts-kit/kernel';
import type { Prisma } from '$generated/prisma/client';
import type {
  BrokerRegistrationRow,
  BrokerRegistrations,
} from '@/contexts/credit-application/file/application/ports/broker-registrations.port';
import { brokerRegistrationCriteria } from '@/contexts/credit-application/file/application/projections/broker-registration-criteria.projection';
import type { Database } from '@/platform/database/database';

/** The broker registrations read model in its table of the credit application schema, confined to the tenant of the work. */
export class PrismaBrokerRegistrations
  extends PrismaReadModelStore<BrokerRegistrationRow, Prisma.TransactionClient>
  implements BrokerRegistrations
{
  constructor(database: Database, scope: ExecutionScope) {
    super(database, {
      definition: brokerRegistrationCriteria,
      delegate: (client) => client.creditApplicationBrokerRegistration,
      table: 'broker_registrations',
      schema: 'credit_application',
      key: 'brokerId',
      columns: {
        brokerId: 'broker_id',
        inForce: 'in_force',
        changedAt: 'changed_at',
      },
      tenant: { scope },
    });
  }
}
