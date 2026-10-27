import { describe, expect, it } from '@jest/globals';
import {
  AuthorizationMap,
  PolicyAccess,
  RoleBasedAuthorizer,
  authorizationMiddleware,
  requires,
  type AccessScope,
} from '@ddd-ts-kit/auth';
import { anActor } from '@ddd-ts-kit/auth/testing';
import { FixedClock, offsetPage } from '@ddd-ts-kit/kernel';
import { createTestBuses } from '@ddd-ts-kit/testing';
import { creditApplicationPermissions } from '@/contexts/credit-application/credit-application.permissions';
import { SearchApplicationsHandler } from '@/contexts/credit-application/file/application/queries/search-applications/search-applications.handler';
import { SearchApplicationsQuery } from '@/contexts/credit-application/file/application/queries/search-applications/search-applications.query';
import type { SearchApplicationsItem } from '@/contexts/credit-application/file/application/queries/search-applications/search-applications.result';
import { FakeSearchApplicationsReader } from '@/contexts/credit-application/test/fakes/search-applications-reader.fake';

const authorizer = new RoleBasedAuthorizer({
  roles: { holder: [creditApplicationPermissions['application.read']] },
});

const holders = authorizationMiddleware({
  authorizer,
  map: AuthorizationMap.of(requires(SearchApplicationsQuery, creditApplicationPermissions['application.read'])),
});

const holder = anActor().withRole('holder').build();
const LINES: readonly SearchApplicationsItem[] = ['application-1', 'application-2', 'application-3'].map(lineOf);

describe('List applications', () => {
  it('answers the page of the applications the reader shows to the actor', async () => {
    const queryBus = arrange(LINES, new PolicyAccess({ authorizer, clock: aClock() }));
    const query = new SearchApplicationsQuery(holder, offsetPage({ limit: 2 }));

    const page = await queryBus.execute(query);

    expect(page.items).toEqual(LINES);
  });

  it('asks the reader for the access scope the actor holds on applications', async () => {
    const queryBus = arrange(LINES, new ScopedAccess({ authorizer, clock: aClock() }, ['application-2']));
    const query = new SearchApplicationsQuery(holder, offsetPage());

    const page = await queryBus.execute(query);

    expect(page.items).toEqual([lineOf('application-2')]);
  });

  it('is refused to an actor who does not hold the permission application.read', async () => {
    const queryBus = arrange(LINES, new PolicyAccess({ authorizer, clock: aClock() }));
    const query = new SearchApplicationsQuery(anActor().build(), offsetPage());

    await expect(queryBus.execute(query)).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });
});

/** An access whose scope on applications is the given identifiers, whatever the actor holds. */
class ScopedAccess extends PolicyAccess {
  constructor(
    options: ConstructorParameters<typeof PolicyAccess>[0],
    private readonly visible: readonly string[],
  ) {
    super(options);
  }

  override scope(): Promise<AccessScope> {
    return Promise.resolve({ kind: 'ids', ids: [...this.visible] });
  }
}

function lineOf(id: string): SearchApplicationsItem {
  return { id, applicantId: 'customer-1', requestedAmountCents: 1000, durationMonths: 12 };
}

function aClock(): FixedClock {
  return new FixedClock(new Date('2026-01-01T00:00:00.000Z'));
}

function arrange(lines: readonly SearchApplicationsItem[], access: PolicyAccess) {
  const { queryBus } = createTestBuses();
  const handler = new SearchApplicationsHandler(new FakeSearchApplicationsReader(lines), access);

  return queryBus.use(holders).register(SearchApplicationsQuery, handler);
}
