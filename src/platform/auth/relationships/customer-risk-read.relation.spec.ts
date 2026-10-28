import { beforeEach, describe, expect, it } from '@jest/globals';
import type { Permission } from '@ddd-ts-kit/auth';
import { InMemoryRelationTupleStore, RelationBasedAuthorizer } from '@ddd-ts-kit/auth/rebac';
import type { Actor } from '@ddd-ts-kit/kernel';
import { relationshipSchema } from '@/platform/auth/relationships/relationship-schema';

const readRisk: Permission = {
  id: 'customer-due-diligence:customer.read-risk',
  context: 'customer-due-diligence',
  name: 'customer.read-risk',
  description: 'Read the risk rating of a customer',
};

const readDueDiligence: Permission = {
  id: 'customer-due-diligence:due-diligence.read',
  context: 'customer-due-diligence',
  name: 'due-diligence.read',
  description: 'Read the due diligence of a customer',
};

describe('customer.read-risk and due-diligence.read, derived on customer', () => {
  let authorizer: RelationBasedAuthorizer;

  beforeEach(async () => {
    const store = new InMemoryRelationTupleStore();

    authorizer = new RelationBasedAuthorizer({ schema: relationshipSchema, store });

    await store.write([
      { object: 'context:customer-due-diligence', relation: 'operator', subject: 'user:carol' },
      { object: 'portfolio:p1', relation: 'advisor', subject: 'user:ada' },
      { object: 'portfolio:p1', relation: 'advisor', subject: 'user:conflicted-ada' },
      { object: 'customer:c1', relation: 'portfolio', subject: 'portfolio:p1' },
      { object: 'customer:c1', relation: 'context', subject: 'context:customer-due-diligence' },
      { object: 'customer:c1', relation: 'conflicted', subject: 'user:conflicted-ada' },
    ]);
  });

  const allowed = async (permission: Permission, actorId: string) =>
    (await authorizer.check({ actor: actorNamed(actorId), permission, resource: { type: 'customer', id: 'c1' } }))
      .allowed;

  it.each([readRisk, readDueDiligence])(
    'lets the compliance officer read through the context: %p',
    async (permission) => {
      expect(await allowed(permission, 'carol')).toBe(true);
    },
  );

  it.each([readRisk, readDueDiligence])(
    'lets the advisor of the customer read through the portfolio: %p',
    async (permission) => {
      expect(await allowed(permission, 'ada')).toBe(true);
    },
  );

  it.each([readRisk, readDueDiligence])('refuses an advisor with a declared conflict: %p', async (permission) => {
    expect(await allowed(permission, 'conflicted-ada')).toBe(false);
  });

  it.each([readRisk, readDueDiligence])('refuses someone with no relation: %p', async (permission) => {
    expect(await allowed(permission, 'carl')).toBe(false);
  });
});

const actorNamed = (id: string): Actor => ({ id, type: 'user', roles: [], attributes: {} });
