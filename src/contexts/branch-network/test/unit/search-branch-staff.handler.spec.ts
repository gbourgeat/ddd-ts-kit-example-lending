import { describe, expect, it } from '@jest/globals';
import { AuthorizationMap, PolicyAccess, authorizationMiddleware, requires, type Permission } from '@ddd-ts-kit/auth';
import { defineSchema, InMemoryRelationTupleStore, RelationBasedAuthorizer, via } from '@ddd-ts-kit/auth/rebac';
import { FixedClock, offsetPage, type Actor } from '@ddd-ts-kit/kernel';
import { createTestBuses } from '@ddd-ts-kit/testing';
import { branchNetworkPermissions } from '@/contexts/branch-network/branch-network.permissions';
import { SearchBranchStaffHandler } from '@/contexts/branch-network/application/queries/search-branch-staff/search-branch-staff.handler';
import { SearchBranchStaffQuery } from '@/contexts/branch-network/application/queries/search-branch-staff/search-branch-staff.query';
import type { SearchBranchStaffItem } from '@/contexts/branch-network/application/queries/search-branch-staff/search-branch-staff.result';
import { FakeSearchBranchStaffReader } from '@/contexts/branch-network/test/fakes/search-branch-staff-reader.fake';

const staffList: Permission = branchNetworkPermissions['staff-member.list'];

/** The relations of the schema the platform gives this permission: a branch manager sees the staff of the branch. */
const schema = defineSchema({
  user: {},
  branch: {
    relations: { manager: ['user'] },
    derived: { [staffList.id]: 'manager' },
  },
  'staff-member': {
    relations: { branch: ['branch'] },
    derived: { [staffList.id]: via('branch', 'manager') },
  },
});

const STAFF: readonly SearchBranchStaffItem[] = [
  { id: 'staff-member-1', branchId: 'branch-1', name: 'Ada' },
  { id: 'staff-member-2', branchId: 'branch-1', name: 'Brice' },
  { id: 'staff-member-3', branchId: 'branch-1', name: 'Chloe' },
  { id: 'staff-member-4', branchId: 'branch-2', name: 'Dan' },
];

const manager = actorNamed('ada');
const memberOfAnotherBranch = actorNamed('carl');

describe('Search branch staff', () => {
  it('answers one page of the staff of the branch to its branch manager, with the total', async () => {
    const queryBus = await arrange();
    const query = new SearchBranchStaffQuery(manager, offsetPage({ limit: 2 }), 'branch-1');

    const page = await queryBus.execute(query);

    expect(page).toEqual({ items: STAFF.slice(0, 2), total: 3 });
  });

  it('refuses a member of another branch to read the staff of this branch', async () => {
    const queryBus = await arrange();
    const query = new SearchBranchStaffQuery(memberOfAnotherBranch, offsetPage(), 'branch-1');

    await expect(queryBus.execute(query)).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });

  it('shows no staff of a branch the actor does not manage, even when asked of a branch they manage', async () => {
    const queryBus = await arrange();
    const query = new SearchBranchStaffQuery(manager, offsetPage(), 'branch-2');

    await expect(queryBus.execute(query)).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });
});

async function arrange() {
  const store = new InMemoryRelationTupleStore();
  const authorizer = new RelationBasedAuthorizer({ schema, store });

  await store.write([
    { object: 'branch:branch-1', relation: 'manager', subject: 'user:ada' },
    { object: 'branch:branch-2', relation: 'manager', subject: 'user:carl' },
    ...STAFF.map((staff) => ({
      object: `staff-member:${staff.id}`,
      relation: 'branch',
      subject: `branch:${staff.branchId}`,
    })),
  ]);

  const holders = authorizationMiddleware({
    authorizer,
    map: AuthorizationMap.of(
      requires(SearchBranchStaffQuery, staffList, {
        resource: (query) => ({ type: 'branch', id: query.branchId }),
      }),
    ),
  });

  const access = new PolicyAccess({ authorizer, clock: new FixedClock(new Date('2026-01-01T00:00:00.000Z')) });
  const handler = new SearchBranchStaffHandler(new FakeSearchBranchStaffReader(STAFF), access);
  const { queryBus } = createTestBuses();

  return queryBus.use(holders).register(SearchBranchStaffQuery, handler);
}

function actorNamed(id: string): Actor {
  return { id, type: 'user', roles: [], attributes: {} };
}
