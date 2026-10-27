import { afterAll, beforeAll, beforeEach, describe, expect, it } from '@jest/globals';
import { FixedExecutionScope, executionContext, type Actor, type EventStamp } from '@ddd-ts-kit/kernel';
import type { DeclaredConflictRow } from '@/contexts/credit-application/decision/application/projections/declared-conflict-row.projection';
import { PrismaDeclaredConflictsStore } from '@/contexts/credit-application/decision/infrastructure/persistence/prisma-declared-conflicts-store.repository';
import { openTestDatabase, type TestDatabase } from '@/platform/database/open-test-database';

const declaredAt = new Date('2026-01-10T09:00:00.000Z');
const laterAt = new Date('2026-02-10T09:00:00.000Z');

let database: TestDatabase;

beforeAll(async () => {
  database = await openTestDatabase();
});

beforeEach(async () => {
  await database.reset();
});

afterAll(async () => {
  await database.close();
});

describe('PrismaDeclaredConflictsStore', () => {
  it('keeps a declared conflict and finds it by its identifier', async () => {
    const store = storeOf('acme');

    await store.keep(conflict('conflict-1', 'staff-1', 'customer-1'), stamp('event-1', declaredAt));

    expect(await store.find('conflict-1')).toEqual(conflict('conflict-1', 'staff-1', 'customer-1'));
  });

  it('finds nothing for a conflict that was never declared', async () => {
    expect(await storeOf('acme').find('conflict-unknown')).toBeUndefined();
  });

  it('keeps one line when the same declaration is heard twice', async () => {
    const store = storeOf('acme');

    await store.keep(conflict('conflict-1', 'staff-1', 'customer-1'), stamp('event-1', declaredAt));
    await store.keep(conflict('conflict-1', 'staff-1', 'customer-1'), stamp('event-1', declaredAt));

    expect(await storeOf('acme').searchOfCustomer('customer-1')).toHaveLength(1);
  });

  it('keeps the later declaration of a conflict over the earlier one it replaces', async () => {
    const store = storeOf('acme');

    await store.keep(conflict('conflict-1', 'staff-1', 'customer-1'), stamp('event-1', declaredAt));
    await store.keep(conflict('conflict-1', 'staff-2', 'customer-2'), stamp('event-2', laterAt));

    expect(await store.find('conflict-1')).toEqual(conflict('conflict-1', 'staff-2', 'customer-2'));
  });

  it('ignores a declaration older than the one the line already holds', async () => {
    const store = storeOf('acme');

    await store.keep(conflict('conflict-1', 'staff-2', 'customer-2'), stamp('event-2', laterAt));
    await store.keep(conflict('conflict-1', 'staff-1', 'customer-1'), stamp('event-1', declaredAt));

    expect(await store.find('conflict-1')).toEqual(conflict('conflict-1', 'staff-2', 'customer-2'));
  });

  it('lists the conflicts declared on one customer, and not those declared on another', async () => {
    const store = storeOf('acme');

    await store.keep(conflict('conflict-1', 'staff-1', 'customer-1'), stamp('event-1', declaredAt));
    await store.keep(conflict('conflict-2', 'staff-2', 'customer-1'), stamp('event-2', declaredAt));
    await store.keep(conflict('conflict-3', 'staff-1', 'customer-9'), stamp('event-3', declaredAt));

    expect(await store.searchOfCustomer('customer-1')).toEqual([
      conflict('conflict-1', 'staff-1', 'customer-1'),
      conflict('conflict-2', 'staff-2', 'customer-1'),
    ]);
  });

  it('lists nothing for a customer no conflict was declared on', async () => {
    expect(await storeOf('acme').searchOfCustomer('customer-unknown')).toEqual([]);
  });

  it('keeps and lists the conflicts of the tenant of the scope, not those of another tenant', async () => {
    await storeOf('acme').keep(conflict('conflict-1', 'staff-1', 'customer-1'), stamp('event-1', declaredAt));
    await storeOf('globex').keep(conflict('conflict-2', 'staff-2', 'customer-1'), stamp('event-2', declaredAt));

    expect(await storeOf('acme').searchOfCustomer('customer-1')).toEqual([
      conflict('conflict-1', 'staff-1', 'customer-1'),
    ]);

    expect(await storeOf('acme').find('conflict-2')).toBeUndefined();
  });
});

function storeOf(tenantId: string): PrismaDeclaredConflictsStore {
  return new PrismaDeclaredConflictsStore(database.persistence.database, scopeOf(tenantId));
}

function conflict(conflictOfInterestId: string, staffMemberId: string, customerId: string): DeclaredConflictRow {
  return { conflictOfInterestId, staffMemberId, customerId };
}

function stamp(eventId: string, occurredAt: Date): EventStamp {
  return { eventId, occurredAt };
}

function scopeOf(tenantId: string): FixedExecutionScope {
  const actor: Actor = { id: 'member-of-' + tenantId, type: 'user', tenantId, roles: [], attributes: {} };

  return new FixedExecutionScope(executionContext({ correlationId: 'store-spec', actor, origin: 'test' }));
}
