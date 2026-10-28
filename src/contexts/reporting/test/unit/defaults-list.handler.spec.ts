import { describe, expect, it } from '@jest/globals';
import { AuthorizationMap, RoleBasedAuthorizer, authorizationMiddleware, requires } from '@ddd-ts-kit/auth';
import { anActor } from '@ddd-ts-kit/auth/testing';
import { createTestBuses } from '@ddd-ts-kit/testing';
import { reportingPermissions } from '@/contexts/reporting/reporting.permissions';
import { DefaultsListHandler } from '@/contexts/reporting/application/queries/defaults-list/defaults-list.handler';
import { DefaultsListQuery } from '@/contexts/reporting/application/queries/defaults-list/defaults-list.query';
import type { DefaultsListResult } from '@/contexts/reporting/application/queries/defaults-list/defaults-list.result';
import { FakeDefaultsListReader } from '@/contexts/reporting/test/fakes/defaults-list-reader.fake';

const holders = authorizationMiddleware({
  authorizer: new RoleBasedAuthorizer({
    roles: { holder: [reportingPermissions['report.defaults']] },
  }),
  map: AuthorizationMap.of(requires(DefaultsListQuery, reportingPermissions['report.defaults'])),
});

const holder = anActor().withRole('holder').build();

const defaulted: DefaultsListResult = {
  loans: [{ loanId: 'loan-1', branchId: 'branch-1', principalCents: 100_000, defaultedAt: '2026-03-05T00:00:00.000Z' }],
};

describe('Defaults list', () => {
  it('answers the loans in default the read model holds', async () => {
    const queryBus = arrange(defaulted);
    const query = new DefaultsListQuery(holder);

    expect(await queryBus.execute(query)).toEqual(defaulted);
  });

  it('is refused to an actor who does not hold the permission report.defaults', async () => {
    const queryBus = arrange({ loans: [] });
    const query = new DefaultsListQuery(anActor().build());

    await expect(queryBus.execute(query)).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });

  it('answers an empty list when no loan is in default', async () => {
    const queryBus = arrange({ loans: [] });

    expect(await queryBus.execute(new DefaultsListQuery(holder))).toEqual({ loans: [] });
  });
});

function arrange(answer: DefaultsListResult) {
  const { queryBus } = createTestBuses();
  const handler = new DefaultsListHandler(new FakeDefaultsListReader(answer));

  return queryBus.use(holders).register(DefaultsListQuery, handler);
}
