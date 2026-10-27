import { beforeEach, describe, expect, it } from '@jest/globals';
import type { Permission } from '@ddd-ts-kit/auth';
import { InMemoryRelationTupleStore, RelationBasedAuthorizer } from '@ddd-ts-kit/auth/rebac';
import type { Actor } from '@ddd-ts-kit/kernel';
import { relationshipSchema } from '@/platform/auth/relationships/relationship-schema';

const loanRead: Permission = {
  id: 'loan.read',
  context: 'servicing',
  name: 'read',
  description: 'Read a loan, as the people who may read its application',
};

describe('loan.read, derived on loan', () => {
  let authorizer: RelationBasedAuthorizer;

  beforeEach(async () => {
    const store = new InMemoryRelationTupleStore();

    authorizer = new RelationBasedAuthorizer({ schema: relationshipSchema, store });

    await store.write([
      { object: 'portfolio:p1', relation: 'advisor', subject: 'user:ada' },
      { object: 'customer:c1', relation: 'portfolio', subject: 'portfolio:p1' },
      { object: 'application:a1', relation: 'customer', subject: 'customer:c1' },
      { object: 'loan:l1', relation: 'application', subject: 'application:a1' },
    ]);
  });

  const readOf = (actorId: string) =>
    authorizer.check({ actor: actorNamed(actorId), permission: loanRead, resource: { type: 'loan', id: 'l1' } });

  it('is held by whoever reads the application the loan comes from', async () => {
    expect((await readOf('ada')).allowed).toBe(true);
  });

  it('is refused to someone with no relation to the application', async () => {
    expect((await readOf('carl')).allowed).toBe(false);
  });
});

const actorNamed = (id: string): Actor => ({ id, type: 'user', roles: [], attributes: {} });
