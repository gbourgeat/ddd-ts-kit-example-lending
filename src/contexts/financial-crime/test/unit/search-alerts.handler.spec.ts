import { describe, expect, it } from '@jest/globals';
import {
  AuthorizationMap,
  PolicyAccess,
  RoleBasedAuthorizer,
  authorizationMiddleware,
  requires,
} from '@ddd-ts-kit/auth';
import { anActor } from '@ddd-ts-kit/auth/testing';
import { FixedClock, offsetPage } from '@ddd-ts-kit/kernel';
import { createTestBuses } from '@ddd-ts-kit/testing';
import { financialCrimePermissions } from '@/contexts/financial-crime/financial-crime.permissions';
import { SearchAlertsHandler } from '@/contexts/financial-crime/application/queries/search-alerts/search-alerts.handler';
import { SearchAlertsQuery } from '@/contexts/financial-crime/application/queries/search-alerts/search-alerts.query';
import type { SearchAlertsItem } from '@/contexts/financial-crime/application/queries/search-alerts/search-alerts.result';
import { FakeSearchAlertsReader } from '@/contexts/financial-crime/test/fakes/search-alerts-reader.fake';

const authorizer = new RoleBasedAuthorizer({
  roles: { complianceOfficer: [financialCrimePermissions['alert.read']] },
});

const holders = authorizationMiddleware({
  authorizer,
  map: AuthorizationMap.of(requires(SearchAlertsQuery, financialCrimePermissions['alert.read'])),
});

const complianceOfficer = anActor().withRole('complianceOfficer').build();

const LINES: readonly SearchAlertsItem[] = [
  { id: 'alert-1', repaymentReference: 'repayment-1' },
  { id: 'alert-2', repaymentReference: 'repayment-2' },
];

describe('List alerts', () => {
  it('shows the alerts of the bank to a compliance officer', async () => {
    const queryBus = arrange(LINES);

    const page = await queryBus.execute(new SearchAlertsQuery(complianceOfficer, offsetPage({ limit: 10 })));

    expect(page.items).toEqual(LINES);
  });

  it('is refused to an actor who does not hold the permission alert.read, so no alert reaches it', async () => {
    const queryBus = arrange(LINES);
    const query = new SearchAlertsQuery(anActor().build(), offsetPage());

    await expect(queryBus.execute(query)).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });

  it('shows no alert when the list it reads holds none', async () => {
    const queryBus = arrange([]);

    const page = await queryBus.execute(new SearchAlertsQuery(complianceOfficer, offsetPage({ limit: 10 })));

    expect(page.items).toEqual([]);
  });
});

function arrange(lines: readonly SearchAlertsItem[]) {
  const { queryBus } = createTestBuses();
  const access = new PolicyAccess({ authorizer, clock: new FixedClock(new Date('2026-01-01T00:00:00.000Z')) });
  const handler = new SearchAlertsHandler(new FakeSearchAlertsReader(lines), access);

  return queryBus.use(holders).register(SearchAlertsQuery, handler);
}
