import { afterAll, beforeAll, beforeEach, describe, expect, it } from '@jest/globals';
import {
  FixedExecutionScope,
  cursorPage,
  encodeCursor,
  executionContext,
  offsetPage,
  type Actor,
} from '@ddd-ts-kit/kernel';
import { Money } from '@/shared-kernel/money.vo';
import { CreditApplicationSubmitted } from '@/contexts/credit-application/file/domain/events/credit-application-submitted.event';
import { PrismaApplicationListProjection } from '@/contexts/credit-application/file/infrastructure/persistence/prisma-application-list-projection.repository';
import type { SearchApplicationsSort } from '@/contexts/credit-application/file/application/queries/search-applications/search-applications.result';
import { PrismaSearchApplicationsReader } from '@/contexts/credit-application/file/infrastructure/persistence/prisma-search-applications.reader';
import { openTestDatabase, type TestDatabase } from '@/platform/database/open-test-database';

const submittedAt = new Date('2026-03-01T10:00:00.000Z');

let database: TestDatabase;

beforeAll(async () => {
  database = await openTestDatabase();
});

beforeEach(async () => {
  await database.reset();

  const acme = new PrismaApplicationListProjection(database.persistence.database, workOf('acme'));
  const globex = new PrismaApplicationListProjection(database.persistence.database, workOf('globex'));

  for (const id of ['credit-application-1', 'credit-application-2', 'credit-application-3']) {
    await acme.recordSubmitted(submitted(id, 'applicant-of-acme'));
  }

  await globex.recordSubmitted(submitted('credit-application-4', 'applicant-of-globex'));
});

afterAll(async () => {
  await database.close();
});

describe('PrismaSearchApplicationsReader', () => {
  it('lists every application of the tenant to a scope that sees all of them, by identifier', async () => {
    const reader = readerIn('acme');

    const page = await reader.search({ kind: 'all' }, offsetPage());

    expect(page.items.map((item) => item.id)).toEqual([
      'credit-application-1',
      'credit-application-2',
      'credit-application-3',
    ]);

    expect(page.total).toBe(3);
  });

  it('shows a branch operator the applications of its branch only', async () => {
    const reader = readerIn('acme');

    const page = await reader.search({ kind: 'ids', ids: ['credit-application-2'] }, offsetPage());

    expect(page.items).toEqual([
      {
        id: 'credit-application-2',
        applicantId: 'applicant-of-acme',
        requestedAmountCents: 1234567,
        durationMonths: 60,
      },
    ]);

    expect(page.total).toBe(1);
  });

  it('shows a broker only the applications the broker brought', async () => {
    const reader = readerIn('acme');

    const page = await reader.search(
      { kind: 'ids', ids: ['credit-application-1', 'credit-application-3'] },
      offsetPage(),
    );

    expect(page.items.map((item) => item.id)).toEqual(['credit-application-1', 'credit-application-3']);
  });

  it('shows nothing to a scope that names no application', async () => {
    const reader = readerIn('acme');

    expect(await reader.search({ kind: 'none' }, offsetPage())).toEqual({ items: [], total: 0 });
  });

  it('shows nothing to a filter scope, which the read model does not know', async () => {
    const reader = readerIn('acme');

    expect(await reader.search({ kind: 'filter', filter: { name: 'Chloe' } }, offsetPage())).toEqual({
      items: [],
      total: 0,
    });
  });

  it('never shows an application of another tenant, even to a scope that sees all', async () => {
    const reader = readerIn('acme');

    const page = await reader.search({ kind: 'all' }, offsetPage());

    expect(page.items.map((item) => item.id)).not.toContain('credit-application-4');
  });

  it('answers a page of the applications in descending order with the total', async () => {
    const reader = readerIn('acme');

    const page = await reader.search(
      { kind: 'all' },
      offsetPage({ offset: 1, limit: 1, sort: [{ field: 'id', direction: 'desc' }] }),
    );

    expect(page.items.map((item) => item.id)).toEqual(['credit-application-2']);
    expect(page.total).toBe(3);
  });

  it('answers the page that follows a cursor, and no cursor once the last application is reached', async () => {
    const reader = readerIn('acme');

    const first = await reader.search({ kind: 'all' }, cursorPage<SearchApplicationsSort>({ limit: 2 }));
    const cursor = encodeCursor({ id: 'credit-application-2' });
    const second = await reader.search({ kind: 'all' }, cursorPage<SearchApplicationsSort>({ limit: 2, cursor }));

    expect(first.items.map((item) => item.id)).toEqual(['credit-application-1', 'credit-application-2']);
    expect(first.nextCursor).toBeDefined();
    expect(second.items.map((item) => item.id)).toEqual(['credit-application-3']);
    expect(second.nextCursor).toBeUndefined();
  });

  it('refuses a cursor the reader did not write, with its code', async () => {
    const reader = readerIn('acme');
    const forged = cursorPage<SearchApplicationsSort>({ limit: 2, cursor: encodeCursor({ id: 42 }) });

    await expect(reader.search({ kind: 'all' }, forged)).rejects.toMatchObject({
      code: 'INVALID_PAGE_REQUEST',
    });
  });
});

function readerIn(tenantId: string): PrismaSearchApplicationsReader {
  return new PrismaSearchApplicationsReader(database.persistence.database, workOf(tenantId));
}

function submitted(id: string, applicantId: string): CreditApplicationSubmitted {
  return new CreditApplicationSubmitted(id, applicantId, Money.ofCents(1234567), 60, submittedAt);
}

function workOf(tenantId: string): FixedExecutionScope {
  const actor: Actor = { id: 'member-of-' + tenantId, type: 'user', tenantId, roles: [], attributes: {} };

  return new FixedExecutionScope(executionContext({ correlationId: 'reader-spec', actor, origin: 'test' }));
}
