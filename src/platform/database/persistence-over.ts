import {
  createPrismaEventSourcing,
  createPrismaUnitOfWork,
  PrismaOutboxStore,
  PrismaProcessedEventStore,
  PrismaProcessStore,
} from '@ddd-ts-kit/prisma';
import type { PrismaClient } from '$generated/prisma/client';
import type { Persistence } from '@/platform/database/persistence';

/** The schema of the messaging tables and of the background work, as prisma/schema/schema.prisma names it. */
const MESSAGING_SCHEMA = 'messaging';
/** The schema of the event store, as prisma/schema/schema.prisma names it. */
const EVENT_STORE_SCHEMA = 'event_store';

/** One object is the unit of work and what repositories query through; the stores are told how to reach their model. */
export function persistenceOver(client: PrismaClient): Persistence {
  const unitOfWork = createPrismaUnitOfWork(client);

  return {
    unitOfWork,
    database: unitOfWork,
    outbox: new PrismaOutboxStore(unitOfWork, {
      delegate: (current) => current.outboxRecord,
      // Prisma Client has no row locking: the claim is the one raw statement of the store.
      claim: { strategy: 'skip-locked', dialect: 'postgresql', schema: MESSAGING_SCHEMA, raw: (current) => current },
      // The tenant of each event, so that its consumers run in that tenant.
      tenant: true,
    }),
    processedEvents: new PrismaProcessedEventStore(unitOfWork, { delegate: (current) => current.processedEvent }),
    processes: (tenant) =>
      new PrismaProcessStore(unitOfWork, { delegate: (current) => current.processInstance, tenant }),
    eventSourcing: (scope) => createPrismaEventSourcing(unitOfWork, { schema: EVENT_STORE_SCHEMA, scope }),
    close: () => client.$disconnect(),
  };
}
