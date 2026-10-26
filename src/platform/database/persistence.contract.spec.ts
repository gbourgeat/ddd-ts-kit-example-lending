import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from '@jest/globals';
import { FixedExecutionScope, executionContext, systemActor } from '@ddd-ts-kit/kernel';
import {
  eventStoreContract,
  outboxStoreContract,
  processedEventStoreContract,
  processStoreContract,
} from '@ddd-ts-kit/testing/contracts';
import { openTestDatabase, type TestDatabase } from '@/platform/database/open-test-database';
import type { Persistence } from '@/platform/database/persistence';

// The stores of the kit as this platform wires them, held to the contracts of their ports with the
// capabilities the stack turns on: a store bound without what the stack asks for fails here.

const runner = { describe, it, expect, beforeEach, afterEach };

let database: TestDatabase;

beforeAll(async () => {
  database = await openTestDatabase();
});

afterAll(async () => {
  await database.close();
});

outboxStoreContract(runner, {
  name: 'The outbox store of the platform',
  createStore: async () => (await emptied()).outbox,
  leaseMs: 30_000,
  carriesTenant: true,
});

processedEventStoreContract(runner, {
  name: 'The processed-event store of the platform',
  createStore: async () => (await emptied()).processedEvents,
});

eventStoreContract(runner, {
  name: 'The event store of the platform',
  createStore: async () => (await emptied()).eventSourcing(new FixedExecutionScope()).events,
  createCompanions: async () => (await emptied()).eventSourcing(new FixedExecutionScope()),
  createTenantStore: async () => {
    const scope = new FixedExecutionScope();

    return { scope, store: (await emptied()).eventSourcing(scope).events };
  },
});

/** The work of a tenant of its own, beside the two of the contract. */
const work = new FixedExecutionScope(
  executionContext({ correlationId: 'contract', actor: systemActor('contract'), origin: 'test', tenantId: 'initech' }),
);

processStoreContract(runner, {
  name: 'The process store of the platform',
  createStore: async () => (await emptied()).processes(work),
  unitOfWork: () => database.persistence.unitOfWork,
  storeInTenant: (scope) => database.persistence.processes(scope),
});

/** The persistence of the platform, on a database emptied before each test. */
async function emptied(): Promise<Persistence> {
  await database.reset();

  return database.persistence;
}
