import { beforeEach, describe, expect, it } from '@jest/globals';
import type { Permission } from '@ddd-ts-kit/auth';
import { InMemoryRelationTupleStore, RelationBasedAuthorizer } from '@ddd-ts-kit/auth/rebac';
import type { Actor } from '@ddd-ts-kit/kernel';
import { relationshipSchema } from '@/platform/auth/relationships/relationship-schema';

const applicationRead: Permission = {
  id: 'credit-application:application.read',
  context: 'credit-application',
  name: 'read',
  description: 'Read an application of a customer',
};

describe('application.read, derived on application', () => {
  let store: InMemoryRelationTupleStore;
  let authorizer: RelationBasedAuthorizer;

  beforeEach(async () => {
    store = new InMemoryRelationTupleStore();
    authorizer = new RelationBasedAuthorizer({ schema: relationshipSchema, store });

    await store.write([
      { object: 'portfolio:p1', relation: 'advisor', subject: 'user:ada' },
      { object: 'customer:c1', relation: 'portfolio', subject: 'portfolio:p1' },
      { object: 'application:a1', relation: 'customer', subject: 'customer:c1' },
      { object: 'application:a1', relation: 'co-borrower', subject: 'user:bob' },
      { object: 'application:a1', relation: 'broker', subject: 'user:brenda' },
    ]);
  });

  const readOf = (actorId: string) =>
    authorizer.check({
      actor: actorNamed(actorId),
      permission: applicationRead,
      resource: { type: 'application', id: 'a1' },
    });

  it('is held by the advisor of the portfolio the customer belongs to', async () => {
    expect((await readOf('ada')).allowed).toBe(true);
  });

  it('is held by the co-borrower of the application', async () => {
    expect((await readOf('bob')).allowed).toBe(true);
  });

  it('is held by the broker who brought the application, and no other broker', async () => {
    expect((await readOf('brenda')).allowed).toBe(true);
    expect((await readOf('carl')).allowed).toBe(false);
  });

  it('is refused to an advisor who declared a conflict of interest with the customer', async () => {
    await store.write([{ object: 'customer:c1', relation: 'conflicted', subject: 'user:ada' }]);

    expect((await readOf('ada')).allowed).toBe(false);
  });
});

const actorNamed = (id: string): Actor => ({ id, type: 'user', roles: [], attributes: {} });
