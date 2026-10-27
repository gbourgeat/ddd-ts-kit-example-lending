import { beforeEach, describe, expect, it } from '@jest/globals';
import type { Permission } from '@ddd-ts-kit/auth';
import { InMemoryRelationTupleStore, RelationBasedAuthorizer } from '@ddd-ts-kit/auth/rebac';
import type { Actor } from '@ddd-ts-kit/kernel';
import { relationshipSchema } from '@/platform/auth/relationships/relationship-schema';

const applicationSubmit: Permission = {
  id: 'application.submit',
  context: 'credit-application',
  name: 'submit',
  description: 'Submit an application for a loan, as the customer it is for',
};

describe('application.submit, derived on customer', () => {
  let authorizer: RelationBasedAuthorizer;

  beforeEach(async () => {
    const store = new InMemoryRelationTupleStore();

    authorizer = new RelationBasedAuthorizer({ schema: relationshipSchema, store });
    await store.write([{ object: 'customer:c1', relation: 'self', subject: 'user:ada' }]);
  });

  const submitFor = (actorId: string, customerId: string) =>
    authorizer.check({
      actor: actorNamed(actorId),
      permission: applicationSubmit,
      resource: { type: 'customer', id: customerId },
    });

  it('is held by the customer itself', async () => {
    expect((await submitFor('ada', 'c1')).allowed).toBe(true);
  });

  it('is refused to another person, even one of the bank', async () => {
    expect((await submitFor('carl', 'c1')).allowed).toBe(false);
  });
});

const actorNamed = (id: string): Actor => ({ id, type: 'user', roles: [], attributes: {} });
