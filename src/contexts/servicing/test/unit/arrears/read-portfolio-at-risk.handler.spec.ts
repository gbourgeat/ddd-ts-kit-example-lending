import { describe, expect, it } from '@jest/globals';
import { AuthorizationMap, RoleBasedAuthorizer, authorizationMiddleware, requires } from '@ddd-ts-kit/auth';
import { anActor } from '@ddd-ts-kit/auth/testing';
import { createTestBuses } from '@ddd-ts-kit/testing';
import { servicingPermissions } from '@/contexts/servicing/servicing.permissions';
import { ReadPortfolioAtRiskHandler } from '@/contexts/servicing/arrears/application/queries/read-portfolio-at-risk/read-portfolio-at-risk.handler';
import { ReadPortfolioAtRiskQuery } from '@/contexts/servicing/arrears/application/queries/read-portfolio-at-risk/read-portfolio-at-risk.query';
import type { ReadPortfolioAtRiskResult } from '@/contexts/servicing/arrears/application/queries/read-portfolio-at-risk/read-portfolio-at-risk.result';
import { FakeReadPortfolioAtRiskReader } from '@/contexts/servicing/test/fakes/read-portfolio-at-risk-reader.fake';

const holders = authorizationMiddleware({
  authorizer: new RoleBasedAuthorizer({
    roles: { holder: [servicingPermissions['loan.read-portfolio']] },
  }),
  map: AuthorizationMap.of(requires(ReadPortfolioAtRiskQuery, servicingPermissions['loan.read-portfolio'])),
});

const holder = anActor().withRole('holder').build();

const ANSWER: ReadPortfolioAtRiskResult = {
  buckets: [{ bucket: 'None', loans: 1, principalCents: 100_000 }],
  openPrincipalCents: 100_000,
  atRiskBasisPoints: 0,
};

describe('Read portfolio at risk', () => {
  it('answers the portfolio the reader holds, as it is', async () => {
    const queryBus = arrange(ANSWER);
    const query = new ReadPortfolioAtRiskQuery(holder);

    expect(await queryBus.execute(query)).toEqual(ANSWER);
  });

  it('is refused to an actor who does not hold the permission loan.read-portfolio', async () => {
    const queryBus = arrange(ANSWER);
    const query = new ReadPortfolioAtRiskQuery(anActor().build());

    await expect(queryBus.execute(query)).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });
});

function arrange(answer: ReadPortfolioAtRiskResult) {
  const { queryBus } = createTestBuses();
  const handler = new ReadPortfolioAtRiskHandler(new FakeReadPortfolioAtRiskReader(answer));

  return queryBus.use(holders).register(ReadPortfolioAtRiskQuery, handler);
}
