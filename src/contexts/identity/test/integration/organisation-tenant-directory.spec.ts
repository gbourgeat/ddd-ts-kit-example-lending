import { afterAll, beforeAll, beforeEach, describe, expect, it } from '@jest/globals';
import { FixedClock, FixedExecutionScope, executionContext, type Actor } from '@ddd-ts-kit/kernel';
import { PrismaOrganisationRepository } from '@/contexts/identity/infrastructure/persistence/prisma-organisation.repository';
import { PrismaOrganisationTenantDirectory } from '@/contexts/identity/infrastructure/persistence/prisma-organisation-tenant-directory.reader';
import { openTestDatabase, type TestDatabase } from '@/platform/database/open-test-database';
import { anOrganisation } from '@/contexts/identity/test/builders/organisation.builder';

const clock = new FixedClock(new Date('2026-01-01T00:00:00.000Z'));
const actor: Actor = { id: 'subject-ada', type: 'user', roles: [], attributes: {} };

const scope = new FixedExecutionScope(
  executionContext({ correlationId: 'tenant-directory-spec', actor, origin: 'test' }),
);

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

describe('PrismaOrganisationTenantDirectory', () => {
  it('lists no tenant while no organisation was opened', async () => {
    const { directory } = arrange();

    expect(await directory.tenants()).toEqual([]);
  });

  it('lists the organisations of the application as its tenants, by their id', async () => {
    const { organisations, directory } = arrange();

    await organisations.save(anOrganisation().identifiedBy('globex').build());
    await organisations.save(anOrganisation().identifiedBy('acme').build());

    expect(await directory.tenants()).toEqual(['acme', 'globex']);
  });

  it('lists an organisation opened after the first read, on the same directory', async () => {
    const { organisations, directory } = arrange();

    await organisations.save(anOrganisation().identifiedBy('acme').build());
    expect(await directory.tenants()).toEqual(['acme']);

    await organisations.save(anOrganisation().identifiedBy('globex').build());
    expect(await directory.tenants()).toEqual(['acme', 'globex']);
  });
});

function arrange() {
  const organisations = new PrismaOrganisationRepository(database.persistence.database, scope, clock);
  const directory = new PrismaOrganisationTenantDirectory(database.persistence.database);

  return { organisations, directory };
}
