import { describe, expect, it } from '@jest/globals';
import { PolicyAccess, RoleBasedAuthorizer } from '@ddd-ts-kit/auth';
import { anActor } from '@ddd-ts-kit/auth/testing';
import { FixedClock } from '@ddd-ts-kit/kernel';
import { createTestBuses } from '@ddd-ts-kit/testing';
import { creditApplicationPermissions } from '@/contexts/credit-application/credit-application.permissions';
import { ExplainRefusalHandler } from '@/contexts/credit-application/file/application/queries/explain-refusal/explain-refusal.handler';
import { ExplainRefusalQuery } from '@/contexts/credit-application/file/application/queries/explain-refusal/explain-refusal.query';
import { AccessRule } from '@/contexts/credit-application/file/domain/vocabularies/access-rule.vocabulary';
import { FakeAccessExplanations } from '@/contexts/credit-application/test/fakes/access-explanations.fake';

const reader = anActor().withRole('reader').build();
const stranger = anActor().build();

describe('Explain refusal', () => {
  it('answers an application the actor may read as visible, without asking for the rules that refuse it', async () => {
    const { queryBus, explanations } = arrange();

    const answer = await queryBus.execute(new ExplainRefusalQuery(reader, 'application-1'));

    expect(answer).toEqual({ outcome: 'visible' });
    expect(explanations.received()).toEqual([]);
  });

  it('refuses an application the actor may not read, with the rule that refuses it', async () => {
    const { queryBus, explanations } = arrange();

    explanations.answerWith([AccessRule.NotInPortfolio, AccessRule.NotBroughtByYou]);

    await expect(queryBus.execute(new ExplainRefusalQuery(stranger, 'application-1'))).rejects.toMatchObject({
      code: 'APPLICATION_NOT_VISIBLE',
      facts: { rules: ['not-in-portfolio', 'not-brought-by-you'] },
    });
  });

  it('asks the rules about the application the actor named, on behalf of that actor', async () => {
    const { queryBus, explanations } = arrange();

    explanations.answerWith([AccessRule.DeclaredConflict]);

    await queryBus.execute(new ExplainRefusalQuery(stranger, 'application-1')).catch(() => undefined);

    expect(explanations.received()).toEqual([{ actor: stranger, applicationId: 'application-1' }]);
  });
});

function arrange() {
  const explanations = new FakeAccessExplanations();
  const { queryBus } = createTestBuses();

  const authorizer = new RoleBasedAuthorizer({
    roles: { reader: [creditApplicationPermissions['application.read']] },
  });

  const access = new PolicyAccess({ authorizer, clock: new FixedClock(new Date('2026-01-01T00:00:00.000Z')) });
  const handler = new ExplainRefusalHandler(access, explanations);

  return { explanations, queryBus: queryBus.register(ExplainRefusalQuery, handler) };
}
