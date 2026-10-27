import { describe, expect, it } from '@jest/globals';
import { AuthorizationMap, RoleBasedAuthorizer, authorizationMiddleware, requires } from '@ddd-ts-kit/auth';
import { anActor } from '@ddd-ts-kit/auth/testing';
import { createTestBuses } from '@ddd-ts-kit/testing';
import { customerDueDiligencePermissions } from '@/contexts/customer-due-diligence/customer-due-diligence.permissions';
import { AssignAdvisorCommand } from '@/contexts/customer-due-diligence/application/commands/assign-advisor/assign-advisor.command';
import { AssignAdvisorHandler } from '@/contexts/customer-due-diligence/application/commands/assign-advisor/assign-advisor.handler';
import { Customer } from '@/contexts/customer-due-diligence/domain/aggregates/customer.aggregate';
import { FakeCustomerRepository } from '@/contexts/customer-due-diligence/test/fakes/customer.repository.fake';
import { aPersonIdentity } from '@/contexts/customer-due-diligence/test/builders/customer.builder';

const holders = authorizationMiddleware({
  authorizer: new RoleBasedAuthorizer({
    roles: { holder: [customerDueDiligencePermissions['customer.assign-advisor']] },
  }),
  map: AuthorizationMap.of(requires(AssignAdvisorCommand, customerDueDiligencePermissions['customer.assign-advisor'])),
});

const holder = anActor().withRole('holder').build();
const identifiedOn = new Date('2026-01-10T00:00:00.000Z');

describe('Assign advisor', () => {
  it('gives the customer its advisor, and answers the customer identifier', async () => {
    const { commandBus, customerRepository } = arrange();

    await customerRepository.save(Customer.create('acme', aPersonIdentity(), identifiedOn));

    const id = await commandBus.execute(new AssignAdvisorCommand(holder, 'acme', 'advisor-1'));

    expect(id).toBe('acme');
    expect((await customerRepository.findById(id))?.toState().advisorId).toBe('advisor-1');
  });

  it('is refused to an actor who does not hold the permission customer.assign-advisor', async () => {
    const { commandBus } = arrange();
    const command = new AssignAdvisorCommand(anActor().build(), 'acme', 'advisor-1');

    await expect(commandBus.execute(command)).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });

  it('refuses the advisor of an unknown customer, and saves nothing', async () => {
    const { commandBus, customerRepository } = arrange();

    await expect(commandBus.execute(new AssignAdvisorCommand(holder, 'unknown', 'advisor-1'))).rejects.toMatchObject({
      code: 'UNKNOWN_CUSTOMER',
    });

    expect(await customerRepository.findById('unknown')).toBeUndefined();
  });
});

function arrange() {
  const { commandBus, clock, dispatching } = createTestBuses({ idPrefix: 'customer' });
  // As the application hands it to the handler: the save announces the events of the customer.
  const customerRepository = dispatching(new FakeCustomerRepository());

  commandBus.use(holders).register(AssignAdvisorCommand, new AssignAdvisorHandler(customerRepository, clock));

  return { commandBus, customerRepository };
}
