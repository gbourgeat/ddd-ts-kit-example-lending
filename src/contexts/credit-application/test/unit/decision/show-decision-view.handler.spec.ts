import { describe, expect, it } from '@jest/globals';
import { AuthorizationMap, RoleBasedAuthorizer, authorizationMiddleware, requires } from '@ddd-ts-kit/auth';
import { anActor } from '@ddd-ts-kit/auth/testing';
import { createTestBuses } from '@ddd-ts-kit/testing';
import { creditApplicationPermissions } from '@/contexts/credit-application/credit-application.permissions';
import { ShowDecisionViewHandler } from '@/contexts/credit-application/decision/application/queries/show-decision-view/show-decision-view.handler';
import { ShowDecisionViewQuery } from '@/contexts/credit-application/decision/application/queries/show-decision-view/show-decision-view.query';
import type { ShowDecisionViewResult } from '@/contexts/credit-application/decision/application/queries/show-decision-view/show-decision-view.result';
import { FakeShowDecisionViewReader } from '@/contexts/credit-application/test/fakes/show-decision-view-reader.fake';

const holders = authorizationMiddleware({
  authorizer: new RoleBasedAuthorizer({
    roles: { holder: [creditApplicationPermissions['application.decide']] },
  }),
  map: AuthorizationMap.of(requires(ShowDecisionViewQuery, creditApplicationPermissions['application.decide'])),
});

const holder = anActor().withRole('holder').build();

const view: ShowDecisionViewResult = {
  applicationId: 'application-1',
  decision: {
    outcome: 'approve',
    deciderId: 'advisor-1',
    level: 'advisor',
    reasons: '',
    conditions: '',
    approvedAmountCents: 1_000_000,
    branchId: 'branch-1',
    exception: false,
    decidedAt: new Date('2026-03-03T10:00:00.000Z'),
  },
  assessment: undefined,
  register: undefined,
  refusalReview: undefined,
};

describe('Show decision view', () => {
  it('answers the view of the decision the file recorded', async () => {
    const queryBus = arrange(view);
    const query = new ShowDecisionViewQuery(holder, 'application-1');

    expect(await queryBus.execute(query)).toEqual(view);
  });

  it('is refused to an actor who does not hold the permission application.decide', async () => {
    const queryBus = arrange(view);
    const query = new ShowDecisionViewQuery(anActor().build(), 'application-1');

    await expect(queryBus.execute(query)).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });

  it('refuses to show a decision an application does not have, by its code', async () => {
    const queryBus = arrange(undefined);
    const query = new ShowDecisionViewQuery(holder, 'application-1');

    await expect(queryBus.execute(query)).rejects.toMatchObject({ code: 'NOT_DECIDED' });
  });
});

function arrange(answer: ShowDecisionViewResult | undefined) {
  const { queryBus } = createTestBuses();
  const handler = new ShowDecisionViewHandler(new FakeShowDecisionViewReader(answer));

  return queryBus.use(holders).register(ShowDecisionViewQuery, handler);
}
