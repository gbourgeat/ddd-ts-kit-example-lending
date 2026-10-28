import { PolicyAccess } from '@ddd-ts-kit/auth';
import { FixedClock } from '@ddd-ts-kit/kernel';
import { describe, expect, it } from '@jest/globals';
import { AuthorizationMap, RoleBasedAuthorizer, authorizationMiddleware, requires } from '@ddd-ts-kit/auth';
import { anActor } from '@ddd-ts-kit/auth/testing';
import { createTestBuses } from '@ddd-ts-kit/testing';
import { customerDueDiligencePermissions } from '@/contexts/customer-due-diligence/customer-due-diligence.permissions';
import { GetCustomerDueDiligenceHandler } from '@/contexts/customer-due-diligence/application/queries/get-customer-due-diligence/get-customer-due-diligence.handler';
import { GetCustomerDueDiligenceQuery } from '@/contexts/customer-due-diligence/application/queries/get-customer-due-diligence/get-customer-due-diligence.query';
import type { GetCustomerDueDiligenceResult } from '@/contexts/customer-due-diligence/application/queries/get-customer-due-diligence/get-customer-due-diligence.result';
import { FakeGetCustomerDueDiligenceReader } from '@/contexts/customer-due-diligence/test/fakes/get-customer-due-diligence-reader.fake';

const holders = authorizationMiddleware({
  authorizer: new RoleBasedAuthorizer({
    roles: { holder: [customerDueDiligencePermissions['due-diligence.read']] },
  }),
  map: AuthorizationMap.of(
    requires(GetCustomerDueDiligenceQuery, customerDueDiligencePermissions['due-diligence.read']),
  ),
});

const holder = anActor().withRole('holder').build();

describe('Get customer due diligence', () => {
  it('answers what the read model holds', async () => {
    const answer: GetCustomerDueDiligenceResult = { customerId: 'acme' };
    const queryBus = arrange(answer);
    const query = new GetCustomerDueDiligenceQuery(holder, 'acme');

    expect(await queryBus.execute(query)).toEqual(answer);
  });

  it('is refused to an actor who does not hold the permission due-diligence.read', async () => {
    const queryBus = arrange({ customerId: 'acme' });
    const query = new GetCustomerDueDiligenceQuery(anActor().build(), 'acme');

    await expect(queryBus.execute(query)).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });

  // TODO(domain): replace each entry below by a test named after what "get customer due diligence" shows and to whom.
  it.todo('answers only what the asker is allowed to see');
  it.todo('applies each criterion of the query');
});

function arrange(answer: GetCustomerDueDiligenceResult) {
  const { queryBus } = createTestBuses();

  const handler = new GetCustomerDueDiligenceHandler(
    new FakeGetCustomerDueDiligenceReader(answer),
    new PolicyAccess({
      authorizer: new RoleBasedAuthorizer({
        roles: { holder: [customerDueDiligencePermissions['due-diligence.read']] },
      }),
      clock: new FixedClock(new Date(0)),
    }),
  );

  return queryBus.use(holders).register(GetCustomerDueDiligenceQuery, handler);
}
