import { describe, expect, it } from '@jest/globals';
import { InMemoryRelationTupleStore } from '@ddd-ts-kit/auth/rebac';
import type { Actor } from '@ddd-ts-kit/kernel';
import { AccessExplainer } from '@/platform/auth/authorization/access-explainer';
import { RemoteAccessExplanations } from '@/contexts/credit-application/file/infrastructure/external/remote-access-explanations.adapter';
import { AccessRule } from '@/contexts/credit-application/file/domain/vocabularies/access-rule.vocabulary';

const portfolio = [
  { object: 'portfolio:p1', relation: 'advisor', subject: 'user:ada' },
  { object: 'customer:c1', relation: 'portfolio', subject: 'portfolio:p1' },
  { object: 'application:a1', relation: 'customer', subject: 'customer:c1' },
];

describe('Remote access explanations', () => {
  it('names the declared conflict of an advisor who is conflicted with the customer, and no other rule', async () => {
    const rules = await explainedBy(
      [...portfolio, { object: 'customer:c1', relation: 'conflicted', subject: 'user:ada' }],
      'ada',
    );

    expect(rules).toEqual([AccessRule.DeclaredConflict]);
  });

  it('names the rules a stranger is refused by: not in the portfolio, not brought by them', async () => {
    const rules = await explainedBy(
      [{ object: 'application:a1', relation: 'customer', subject: 'customer:c1' }],
      'carl',
    );

    expect(rules).toEqual([AccessRule.NotInPortfolio, AccessRule.NotBroughtByYou]);
  });

  it('names the broker who did not bring the application as not brought by them', async () => {
    const rules = await explainedBy(
      [...portfolio, { object: 'application:a1', relation: 'broker', subject: 'user:bob' }],
      'carl',
    );

    expect(rules).toContain(AccessRule.NotBroughtByYou);
    expect(rules).not.toContain(AccessRule.DeclaredConflict);
  });
});

async function explainedBy(tuples: { object: string; relation: string; subject: string }[], who: string) {
  const store = new InMemoryRelationTupleStore();

  await store.write(tuples);

  const adapter = new RemoteAccessExplanations(new AccessExplainer(store));

  return adapter.refusingRules(actorNamed(who), 'a1');
}

const actorNamed = (id: string): Actor => ({ id, type: 'user', roles: [], attributes: {} });
