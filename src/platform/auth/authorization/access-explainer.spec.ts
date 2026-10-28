import { describe, expect, it } from '@jest/globals';
import type { Permission } from '@ddd-ts-kit/auth';
import { InMemoryRelationTupleStore } from '@ddd-ts-kit/auth/rebac';
import type { Actor } from '@ddd-ts-kit/kernel';
import { AccessExplainer } from '@/platform/auth/authorization/access-explainer';

const applicationRead: Permission = {
  id: 'credit-application:application.read',
  context: 'credit-application',
  name: 'read',
  description: 'Read an application of a customer',
};

describe('Access explainer', () => {
  it('says the actor is conflicted with the customer when a declared conflict excludes them', async () => {
    const relations = new InMemoryRelationTupleStore();

    await relations.write([
      { object: 'portfolio:p1', relation: 'advisor', subject: 'user:ada' },
      { object: 'customer:c1', relation: 'portfolio', subject: 'portfolio:p1' },
      { object: 'application:a1', relation: 'customer', subject: 'customer:c1' },
      { object: 'customer:c1', relation: 'conflicted', subject: 'user:ada' },
    ]);

    const steps = await new AccessExplainer(relations).explain(actorNamed('ada'), applicationRead, {
      type: 'application',
      id: 'a1',
    });

    expect(steps).toContainEqual({ text: expect.stringContaining('user:ada is conflicted of'), holds: true });
  });

  it('says nobody related the stranger to the application', async () => {
    const steps = await new AccessExplainer(new InMemoryRelationTupleStore()).explain(
      actorNamed('carl'),
      applicationRead,
      { type: 'application', id: 'a1' },
    );

    expect(steps).toContainEqual({ text: 'nobody is broker of application:a1', holds: false });
  });
});

const actorNamed = (id: string): Actor => ({ id, type: 'user', roles: [], attributes: {} });
