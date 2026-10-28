import { describe, expect, it } from '@jest/globals';
import { AuthorizationMap, RoleBasedAuthorizer, authorizationMiddleware, requires } from '@ddd-ts-kit/auth';
import { anActor } from '@ddd-ts-kit/auth/testing';
import { createTestBuses } from '@ddd-ts-kit/testing';
import { servicingPermissions } from '@/contexts/servicing/servicing.permissions';
import { ReadLoanHandler } from '@/contexts/servicing/ledger/application/queries/read-loan/read-loan.handler';
import { ReadLoanQuery } from '@/contexts/servicing/ledger/application/queries/read-loan/read-loan.query';
import type { ReadLoanResult } from '@/contexts/servicing/ledger/application/queries/read-loan/read-loan.result';
import { FakeReadLoanReader } from '@/contexts/servicing/test/fakes/read-loan-reader.fake';

const holders = authorizationMiddleware({
  authorizer: new RoleBasedAuthorizer({
    roles: { holder: [servicingPermissions['loan.read']] },
  }),
  map: AuthorizationMap.of(requires(ReadLoanQuery, servicingPermissions['loan.read'])),
});

const holder = anActor().withRole('holder').build();

const loan: ReadLoanResult = {
  loanId: 'application-1',
  status: 'paid-out',
  principalCents: 100_000,
  annualRateBasisPoints: 500,
  durationMonths: 12,
  instalmentsCents: [8_560],
};

describe('Read loan', () => {
  it('answers the status, the amount, the duration and the instalments of the loan', async () => {
    const queryBus = arrange(loan);

    expect(await queryBus.execute(new ReadLoanQuery(holder, 'application-1'))).toEqual(loan);
  });

  it('is refused to an actor who does not hold the permission loan.read', async () => {
    const queryBus = arrange(loan);
    const query = new ReadLoanQuery(anActor().build(), 'application-1');

    await expect(queryBus.execute(query)).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });
});

function arrange(answer: ReadLoanResult) {
  const { queryBus } = createTestBuses();
  const handler = new ReadLoanHandler(new FakeReadLoanReader(answer));

  return queryBus.use(holders).register(ReadLoanQuery, handler);
}
