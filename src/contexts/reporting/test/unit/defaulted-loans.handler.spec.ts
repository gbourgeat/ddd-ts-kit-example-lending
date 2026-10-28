import { describe, expect, it } from '@jest/globals';
import { AuthorizationMap, RoleBasedAuthorizer, authorizationMiddleware, requires } from '@ddd-ts-kit/auth';
import { anActor } from '@ddd-ts-kit/auth/testing';
import { createTestBuses } from '@ddd-ts-kit/testing';
import { reportingPermissions } from '@/contexts/reporting/reporting.permissions';
import { DefaultedLoansHandler } from '@/contexts/reporting/application/queries/defaulted-loans/defaulted-loans.handler';
import { DefaultedLoansQuery } from '@/contexts/reporting/application/queries/defaulted-loans/defaulted-loans.query';
import type { DefaultedLoansResult } from '@/contexts/reporting/application/queries/defaulted-loans/defaulted-loans.result';
import { FakeDefaultedLoansReader } from '@/contexts/reporting/test/fakes/defaulted-loans-reader.fake';

const holders = authorizationMiddleware({
  authorizer: new RoleBasedAuthorizer({
    roles: { holder: [reportingPermissions['report.defaults']] },
  }),
  map: AuthorizationMap.of(requires(DefaultedLoansQuery, reportingPermissions['report.defaults'])),
});

const holder = anActor().withRole('holder').build();

describe('Defaulted loans', () => {
  it('answers each defaulted loan of the read model with its branch and its amount', async () => {
    const answer: DefaultedLoansResult = {
      loans: [
        {
          loanId: 'loan-1',
          branchId: 'branch-1',
          principalCents: 100_000,
          defaultedAt: '2026-03-05T00:00:00.000Z',
        },
      ],
    };

    const queryBus = arrange(answer);
    const query = new DefaultedLoansQuery(holder);

    expect(await queryBus.execute(query)).toEqual(answer);
  });

  it('is refused to an actor who does not hold the permission report.defaults', async () => {
    const queryBus = arrange({ loans: [] });
    const query = new DefaultedLoansQuery(anActor().build());

    await expect(queryBus.execute(query)).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });
});

function arrange(answer: DefaultedLoansResult) {
  const { queryBus } = createTestBuses();
  const handler = new DefaultedLoansHandler(new FakeDefaultedLoansReader(answer));

  return queryBus.use(holders).register(DefaultedLoansQuery, handler);
}
