import { describe, expect, it } from '@jest/globals';
import { AuthorizationMap, RoleBasedAuthorizer, authorizationMiddleware, requires } from '@ddd-ts-kit/auth';
import { anActor } from '@ddd-ts-kit/auth/testing';
import { createTestBuses } from '@ddd-ts-kit/testing';
import { customerDueDiligencePermissions } from '@/contexts/customer-due-diligence/customer-due-diligence.permissions';
import { EndRelationshipCommand } from '@/contexts/customer-due-diligence/application/commands/end-relationship/end-relationship.command';
import { EndRelationshipHandler } from '@/contexts/customer-due-diligence/application/commands/end-relationship/end-relationship.handler';
import { Customer } from '@/contexts/customer-due-diligence/domain/aggregates/customer.aggregate';
import { FakeCustomerRepository } from '@/contexts/customer-due-diligence/test/fakes/customer.repository.fake';
import { aPersonIdentity } from '@/contexts/customer-due-diligence/test/builders/customer.builder';

const holders = authorizationMiddleware({
  authorizer: new RoleBasedAuthorizer({
    roles: { holder: [customerDueDiligencePermissions['relationship.end']] },
  }),
  map: AuthorizationMap.of(requires(EndRelationshipCommand, customerDueDiligencePermissions['relationship.end'])),
});

const holder = anActor().withRole('holder').build();
const identifiedOn = new Date('2026-01-10T00:00:00.000Z');

describe('End relationship', () => {
  it('ends the relationship with the customer, and answers its identifier', async () => {
    const { commandBus, customerRepository } = arrange();

    await customerRepository.save(Customer.create('acme', aPersonIdentity(), identifiedOn));

    const id = await commandBus.execute(new EndRelationshipCommand(holder, 'acme'));

    expect(id).toBe('acme');
    expect((await customerRepository.findById('acme'))?.toState().relationshipEndedAt).toBeDefined();
  });

  it('refuses to end the relationship with an unknown customer', async () => {
    const { commandBus } = arrange();

    await expect(commandBus.execute(new EndRelationshipCommand(holder, 'unknown'))).rejects.toMatchObject({
      code: 'UNKNOWN_CUSTOMER',
    });
  });

  it('is refused to an actor who does not hold the permission relationship.end', async () => {
    const { commandBus } = arrange();
    const command = new EndRelationshipCommand(anActor().build(), 'acme');

    await expect(commandBus.execute(command)).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });
});

function arrange() {
  const { commandBus, clock, dispatching } = createTestBuses({ idPrefix: 'customer' });
  const customerRepository = dispatching(new FakeCustomerRepository());

  const handler = new EndRelationshipHandler(customerRepository, clock);

  commandBus.use(holders).register(EndRelationshipCommand, handler);

  return { commandBus, customerRepository };
}
