import { afterAll, beforeAll, beforeEach, describe, expect, it } from '@jest/globals';
import {
  ERASED_PERSONAL_DATA,
  FixedClock,
  FixedExecutionScope,
  executionContext,
  type Actor,
  type ExecutionContext,
} from '@ddd-ts-kit/kernel';
import { PrismaStaffMemberRepository } from '@/contexts/branch-network/infrastructure/persistence/prisma-staff-member.repository';
import { PrismaBranchNetworkPersonalDataErasure } from '@/contexts/branch-network/infrastructure/persistence/prisma-branch-network-personal-data-erasure.repository';
import { PrismaBranchNetworkPersonalDataExport } from '@/contexts/branch-network/infrastructure/persistence/prisma-branch-network-personal-data-export.repository';
import type { Prisma, BranchNetworkStaffMember as StaffMemberRow } from '$generated/prisma/client';
import { openTestDatabase, type TestDatabase } from '@/platform/database/open-test-database';
import { aStaffMember } from '@/contexts/branch-network/test/builders/staff-member.builder';
import { FakeBranchNetworkPersonalDataErasure } from '@/contexts/branch-network/test/fakes/branch-network-personal-data-erasure.fake';
import { FakeBranchNetworkPersonalDataExport } from '@/contexts/branch-network/test/fakes/branch-network-personal-data-export.fake';

/** What a test writes into the columns of a person: the generated mapper writes none of them yet. */
type Personal = Prisma.BranchNetworkStaffMemberUpdateInput;

const clock = new FixedClock(new Date('2026-01-01T00:00:00.000Z'));

/** What `staff_members` keeps of two people in clear, as a use case would have written it. */
const OF_ADA: Personal = {
  name: 'name of ada',
  email: 'email of ada',
};

const OF_BOB: Personal = {
  name: 'name of bob',
  email: 'email of bob',
};

/** What the row of Ada reads once she is erased: the declaration says `pseudonymise`. */
const ERASED = {
  name: ERASED_PERSONAL_DATA,
  email: ERASED_PERSONAL_DATA,
};

/** The source every record of `staff_members` names: the context, then the table. */
const SOURCE = 'branch-network.staff_members';

/** What the export hands over of Ada: the personal columns alone, as plain data. */
const EXPORTED_OF_ADA = {
  name: 'name of ada',
  email: 'email of ada',
};

/** What the export hands over once Ada is erased: what the row reads. */
const EXPORTED_ERASED = {
  name: ERASED_PERSONAL_DATA,
  email: ERASED_PERSONAL_DATA,
};

let database: TestDatabase;
let scope: FixedExecutionScope;
let repository: PrismaStaffMemberRepository;
let erasure: PrismaBranchNetworkPersonalDataErasure;
let exported: PrismaBranchNetworkPersonalDataExport;

beforeAll(async () => {
  database = await openTestDatabase();
});

afterAll(async () => {
  await database.close();
});

beforeEach(async () => {
  await database.reset();
  scope = new FixedExecutionScope(workOf('acme'));
  repository = new PrismaStaffMemberRepository(database.persistence.database, scope, clock);
  erasure = new PrismaBranchNetworkPersonalDataErasure(database.persistence.database, scope);
  exported = new PrismaBranchNetworkPersonalDataExport(database.persistence.database, scope);
});

describe('PrismaBranchNetworkPersonalDataErasure', () => {
  it('erases what staff_members keeps of the subject, as the declaration says, and answers the rows it reached', async () => {
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

describe('PrismaBranchNetworkPersonalDataExport', () => {
  it('hands over what staff_members keeps of the subject as plain data, under its source, and nothing of the others', async () => {
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

describe('FakeBranchNetworkPersonalDataErasure and FakeBranchNetworkPersonalDataExport', () => {
  it('counts the rows it holds of a person, and forgets them at the first erasure', async () => {
    const fake = new FakeBranchNetworkPersonalDataErasure().holds('ada', 2);

    expect(await fake.erase('ada')).toBe(2);
    expect(await fake.erase('ada')).toBe(0);
    expect(fake.erased).toEqual(['ada', 'ada']);
  });

  it('hands over the records it holds of a person, and remembers who was asked', async () => {
    const record = { source: SOURCE, values: EXPORTED_OF_ADA };
    const fake = new FakeBranchNetworkPersonalDataExport().holds('ada', record);

    expect(await fake.exportOf('ada')).toEqual([record]);
    expect(await fake.exportOf('bob')).toEqual([]);
    expect(fake.asked).toEqual(['ada', 'bob']);
  });
});

/** a StaffMember saved through its repository, then given what the table keeps of the person. Answers its id. */
async function saved(personal: Personal): Promise<string> {
  const aggregate = aStaffMember().build();

  await repository.save(aggregate);
  await write(aggregate.id, personal);

  return aggregate.id;
}

async function write(id: string, personal: Personal): Promise<void> {
  const rows = database.persistence.database.client().branchNetworkStaffMember;

  await rows.update({ where: { id }, data: personal });
}

async function rowOf(id: string): Promise<StaffMemberRow | undefined> {
  const rows = database.persistence.database.client().branchNetworkStaffMember;
  const row = await rows.findUnique({ where: { id } });

  return row ?? undefined;
}

function workOf(tenantId: string): ExecutionContext {
  const actor: Actor = { id: 'member-of-' + tenantId, type: 'user', tenantId, roles: [], attributes: {} };

  return executionContext({ correlationId: 'personal-data-spec', actor, origin: 'test' });
}
