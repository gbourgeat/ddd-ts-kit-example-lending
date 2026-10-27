import { afterAll, beforeAll, beforeEach, describe, expect, it } from '@jest/globals';
import { FixedExecutionScope, executionContext, type Actor } from '@ddd-ts-kit/kernel';
import { Money } from '@/shared-kernel/money.vo';
import { CreditApplicationSubmitted } from '@/contexts/credit-application/file/domain/events/credit-application-submitted.event';
import { PrismaApplicationListProjection } from '@/contexts/credit-application/file/infrastructure/persistence/prisma-application-list-projection.repository';
import { openTestDatabase, type TestDatabase } from '@/platform/database/open-test-database';

const submittedAt = new Date('2026-03-01T10:00:00.000Z');

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

describe('PrismaApplicationListProjection', () => {
  it('lists a submitted application with its applicant, requested amount, duration and submission date', async () => {
    const projection = new PrismaApplicationListProjection(database.persistence.database, workOf('acme'));

    await projection.recordSubmitted(submitted('credit-application-1'));

    expect(await listedRows()).toEqual([
      {
        id: 'credit-application-1',
        applicantId: 'applicant-1',
        requestedAmountCents: 1234567,
        durationMonths: 60,
        submittedAt,
        tenantId: 'acme',
      },
    ]);
  });

  it('lists an application once when the same submission is heard twice', async () => {
    const projection = new PrismaApplicationListProjection(database.persistence.database, workOf('acme'));

    await projection.recordSubmitted(submitted('credit-application-1'));
    await projection.recordSubmitted(submitted('credit-application-1'));

    expect(await listedRows()).toHaveLength(1);
  });

  it('lists each application of the tenant of the submission, not of another tenant', async () => {
    const acme = new PrismaApplicationListProjection(database.persistence.database, workOf('acme'));
    const globex = new PrismaApplicationListProjection(database.persistence.database, workOf('globex'));

    await acme.recordSubmitted(submitted('credit-application-1'));
    await globex.recordSubmitted(submitted('credit-application-2'));

    expect((await listedRows()).map((row) => [row.id, row.tenantId])).toEqual([
      ['credit-application-1', 'acme'],
      ['credit-application-2', 'globex'],
    ]);
  });
});

function submitted(id: string): CreditApplicationSubmitted {
  return new CreditApplicationSubmitted(id, 'applicant-1', Money.ofCents(1234567), 60, submittedAt);
}

function listedRows() {
  return database.persistence.database.client().creditApplicationListedApplication.findMany({
    orderBy: { id: 'asc' },
  });
}

function workOf(tenantId: string): FixedExecutionScope {
  const actor: Actor = { id: 'member-of-' + tenantId, type: 'user', tenantId, roles: [], attributes: {} };

  return new FixedExecutionScope(executionContext({ correlationId: 'projection-spec', actor, origin: 'test' }));
}
