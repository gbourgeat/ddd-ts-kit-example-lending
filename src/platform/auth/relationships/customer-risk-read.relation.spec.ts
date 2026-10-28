import { beforeEach, describe, expect, it } from '@jest/globals';
import type { Permission } from '@ddd-ts-kit/auth';
import { InMemoryRelationTupleStore, RelationBasedAuthorizer } from '@ddd-ts-kit/auth/rebac';
import type { Actor } from '@ddd-ts-kit/kernel';
import { relationshipSchema } from '@/platform/auth/relationships/relationship-schema';

const permissionOf = (name: string): Permission => ({
  id: `customer-due-diligence:${name}`,
  context: 'customer-due-diligence',
  name,
  description: name,
});

const compliancePermissions = [
  'match.dismiss',
  'customer.rate-risk',
  'customer.read-risk',
  'due-diligence.refresh',
  'due-diligence.read',
].map(permissionOf);

const advisorPermissions = ['customer.view-risk', 'due-diligence.view'].map(permissionOf);

describe('the risk and the due diligence of a customer', () => {
  let authorizer: RelationBasedAuthorizer;

  beforeEach(async () => {
    const store = new InMemoryRelationTupleStore();

    authorizer = new RelationBasedAuthorizer({ schema: relationshipSchema, store });

    await store.write([
      { object: 'context:customer-due-diligence', relation: 'operator', subject: 'user:carol' },
      { object: 'portfolio:p1', relation: 'advisor', subject: 'user:ada' },
      { object: 'portfolio:p1', relation: 'advisor', subject: 'user:conflicted-ada' },
      { object: 'customer:c1', relation: 'portfolio', subject: 'portfolio:p1' },
      { object: 'customer:c1', relation: 'conflicted', subject: 'user:conflicted-ada' },
    ]);
  });

  const allowed = async (permission: Permission, actorId: string, resource: { type: string; id: string }) =>
    (await authorizer.check({ actor: actorNamed(actorId), permission, resource })).allowed;

  it.each(compliancePermissions)('is held by the compliance officer on the context: %p', async (permission) => {
    expect(await allowed(permission, 'carol', { type: 'context', id: 'customer-due-diligence' })).toBe(true);
  });

  it.each(compliancePermissions)('is not held by an advisor on the context: %p', async (permission) => {
    expect(await allowed(permission, 'ada', { type: 'context', id: 'customer-due-diligence' })).toBe(false);
  });

  it.each(advisorPermissions)(
    'is viewed by the advisor of the customer through the portfolio: %p',
    async (permission) => {
      expect(await allowed(permission, 'ada', { type: 'customer', id: 'c1' })).toBe(true);
    },
  );

  it.each(advisorPermissions)('is refused to an advisor with a declared conflict: %p', async (permission) => {
    expect(await allowed(permission, 'conflicted-ada', { type: 'customer', id: 'c1' })).toBe(false);
  });

  it.each(advisorPermissions)('is refused to someone with no relation: %p', async (permission) => {
    expect(await allowed(permission, 'carl', { type: 'customer', id: 'c1' })).toBe(false);
  });
});

const actorNamed = (id: string): Actor => ({ id, type: 'user', roles: [], attributes: {} });
