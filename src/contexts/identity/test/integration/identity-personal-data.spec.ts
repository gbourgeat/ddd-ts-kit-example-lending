import { afterAll, beforeAll, beforeEach, describe, expect, it } from '@jest/globals';
import {
  ERASED_PERSONAL_DATA,
  FixedClock,
  FixedExecutionScope,
  executionContext,
  type Actor,
  type ExecutionContext,
} from '@ddd-ts-kit/kernel';
import { PrismaAccountRepository } from '@/contexts/identity/infrastructure/persistence/prisma-account.repository';
import { PrismaIdentityPersonalDataErasure } from '@/contexts/identity/infrastructure/persistence/prisma-identity-personal-data-erasure.repository';
import { PrismaIdentityPersonalDataExport } from '@/contexts/identity/infrastructure/persistence/prisma-identity-personal-data-export.repository';
import type { Prisma, IdentityAccount as AccountRow } from '$generated/prisma/client';
import { openTestDatabase, type TestDatabase } from '@/platform/database/open-test-database';
import { anAccount } from '@/contexts/identity/test/builders/account.builder';
import { FakeIdentityPersonalDataErasure } from '@/contexts/identity/test/fakes/identity-personal-data-erasure.fake';
import { FakeIdentityPersonalDataExport } from '@/contexts/identity/test/fakes/identity-personal-data-export.fake';

/** What a test writes into the columns of a person: the generated mapper writes none of them yet. */
type Personal = Prisma.IdentityAccountUpdateInput;

const clock = new FixedClock(new Date('2026-01-01T00:00:00.000Z'));

/** What `accounts` keeps of two people in clear, as a use case would have written it. */
const OF_ADA: Personal = {
  email: 'email of ada',
  displayName: 'display_name of ada',
};

const OF_BOB: Personal = {
  email: 'email of bob',
  displayName: 'display_name of bob',
};

/** What the row of Ada reads once she is erased: the declaration says `pseudonymise`. */
const ERASED = {
  email: ERASED_PERSONAL_DATA,
  displayName: ERASED_PERSONAL_DATA,
};

/** The source every record of `accounts` names: the context, then the table. */
const SOURCE = 'identity.accounts';

/** What the export hands over of Ada: the personal columns alone, as plain data. */
const EXPORTED_OF_ADA = {
  email: 'email of ada',
  display_name: 'display_name of ada',
};

/** What the export hands over once Ada is erased: what the row reads. */
const EXPORTED_ERASED = {
  email: ERASED_PERSONAL_DATA,
  display_name: ERASED_PERSONAL_DATA,
};

let database: TestDatabase;
let scope: FixedExecutionScope;
let repository: PrismaAccountRepository;
let erasure: PrismaIdentityPersonalDataErasure;
let exported: PrismaIdentityPersonalDataExport;

beforeAll(async () => {
  database = await openTestDatabase();
});

afterAll(async () => {
  await database.close();
});

beforeEach(async () => {
  await database.reset();
  scope = new FixedExecutionScope(workOf('acme'));
  repository = new PrismaAccountRepository(database.persistence.database, scope, clock);
  erasure = new PrismaIdentityPersonalDataErasure(database.persistence.database, { days: 30 });
  exported = new PrismaIdentityPersonalDataExport(database.persistence.database);
});

describe('PrismaIdentityPersonalDataErasure', () => {
  it('erases what accounts keeps of the subject, as the declaration says, and answers the rows it reached', async () => {
    const ada = await saved(OF_ADA);
    const bob = await saved(OF_BOB);

    expect(await erasure.erase(ada)).toBe(1);
    expect(await rowOf(ada)).toMatchObject(ERASED);
    expect(await rowOf(bob)).toMatchObject(OF_BOB);
  });

  it('reaches nothing the second time: an erasure run again completes one that failed half way', async () => {
    const ada = await saved(OF_ADA);

    await erasure.erase(ada);

    expect(await erasure.erase(ada)).toBe(0);
  });
});

describe('PrismaIdentityPersonalDataExport', () => {
  it('hands over what accounts keeps of the subject as plain data, under its source, and nothing of the others', async () => {
    const ada = await saved(OF_ADA);

    await saved(OF_BOB);

    expect(await exported.exportOf(ada)).toEqual([{ source: SOURCE, values: EXPORTED_OF_ADA }]);
  });

  it('answers what the row reads once the subject is erased', async () => {
    const ada = await saved(OF_ADA);

    await erasure.erase(ada);

    expect(await exported.exportOf(ada)).toEqual([{ source: SOURCE, values: EXPORTED_ERASED }]);
  });
});

describe('FakeIdentityPersonalDataErasure and FakeIdentityPersonalDataExport', () => {
  it('counts the rows it holds of a person, and forgets them at the first erasure', async () => {
    const fake = new FakeIdentityPersonalDataErasure().holds('ada', 2);

    expect(await fake.erase('ada')).toBe(2);
    expect(await fake.erase('ada')).toBe(0);
    expect(fake.erased).toEqual(['ada', 'ada']);
  });

  it('hands over the records it holds of a person, and remembers who was asked', async () => {
    const record = { source: SOURCE, values: EXPORTED_OF_ADA };
    const fake = new FakeIdentityPersonalDataExport().holds('ada', record);

    expect(await fake.exportOf('ada')).toEqual([record]);
    expect(await fake.exportOf('bob')).toEqual([]);
    expect(fake.asked).toEqual(['ada', 'bob']);
  });
});

/** an Account saved through its repository, then given what the table keeps of the person. Answers its id. */
async function saved(personal: Personal): Promise<string> {
  const aggregate = anAccount().build();

  await repository.save(aggregate);
  await write(aggregate.id, personal);

  return aggregate.id;
}

async function write(id: string, personal: Personal): Promise<void> {
  const rows = database.persistence.database.client().identityAccount;

  await rows.update({ where: { id }, data: personal });
}

async function rowOf(id: string): Promise<AccountRow | undefined> {
  const rows = database.persistence.database.client().identityAccount;
  const row = await rows.findUnique({ where: { id } });

  return row ?? undefined;
}

function workOf(tenantId: string): ExecutionContext {
  const actor: Actor = { id: 'member-of-' + tenantId, type: 'user', tenantId, roles: [], attributes: {} };

  return executionContext({ correlationId: 'personal-data-spec', actor, origin: 'test' });
}
