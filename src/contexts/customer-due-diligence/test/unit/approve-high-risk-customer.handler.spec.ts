import { describe, expect, it } from '@jest/globals';
import { AuthorizationMap, RoleBasedAuthorizer, authorizationMiddleware, requires } from '@ddd-ts-kit/auth';
import { anActor } from '@ddd-ts-kit/auth/testing';
import { createTestBuses } from '@ddd-ts-kit/testing';
import { customerDueDiligencePermissions } from '@/contexts/customer-due-diligence/customer-due-diligence.permissions';
import { ApproveHighRiskCustomerCommand } from '@/contexts/customer-due-diligence/application/commands/approve-high-risk-customer/approve-high-risk-customer.command';
import { ApproveHighRiskCustomerHandler } from '@/contexts/customer-due-diligence/application/commands/approve-high-risk-customer/approve-high-risk-customer.handler';
import { FakeCustomerRepository } from '@/contexts/customer-due-diligence/test/fakes/customer.repository.fake';
import { Customer } from '@/contexts/customer-due-diligence/domain/aggregates/customer.aggregate';
import { aPersonIdentity } from '@/contexts/customer-due-diligence/test/builders/customer.builder';

const holders = authorizationMiddleware({
  authorizer: new RoleBasedAuthorizer({
    roles: { holder: [customerDueDiligencePermissions['customer.approve-high-risk']] },
  }),
  map: AuthorizationMap.of(
    requires(ApproveHighRiskCustomerCommand, customerDueDiligencePermissions['customer.approve-high-risk']),
  ),
});

const holder = anActor().withRole('holder').build();

describe('Approve high risk customer', () => {
  it('records the approval of a customer rated high risk, at the day of the approval', async () => {
    const { commandBus, customerRepository, clock } = arrange();

    await saveCustomer(customerRepository, 'high');

    await commandBus.execute(new ApproveHighRiskCustomerCommand(holder, 'customer-1'));

    const approved = await customerRepository.findById('customer-1');

    expect(approved?.toState().highRiskApprovedAt).toEqual(clock.now());
  });

  it('answers the identifier of the customer approved', async () => {
    const { commandBus, customerRepository } = arrange();

    await saveCustomer(customerRepository, 'high');

    const id = await commandBus.execute(new ApproveHighRiskCustomerCommand(holder, 'customer-1'));

    expect(id).toBe('customer-1');
  });

  it('refuses the approval of a customer not rated high risk, with CUSTOMER_NOT_HIGH_RISK', async () => {
    const { commandBus, customerRepository } = arrange();

    await saveCustomer(customerRepository, 'low');

    await expect(commandBus.execute(new ApproveHighRiskCustomerCommand(holder, 'customer-1'))).rejects.toMatchObject({
      code: 'CUSTOMER_NOT_HIGH_RISK',
    });
  });

  it('refuses the approval of an unknown customer, with UNKNOWN_CUSTOMER', async () => {
    const { commandBus } = arrange();

    await expect(commandBus.execute(new ApproveHighRiskCustomerCommand(holder, 'nobody'))).rejects.toMatchObject({
      code: 'UNKNOWN_CUSTOMER',
    });
  });

  it('is refused to an actor who does not hold the permission customer.approve-high-risk', async () => {
    const { commandBus } = arrange();
    const command = new ApproveHighRiskCustomerCommand(anActor().build(), 'customer-1');

    await expect(commandBus.execute(command)).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });
});

/** Saves a customer identified and rated at the given level, as the earlier commands of the bank left it. */
async function saveCustomer(
  customerRepository: FakeCustomerRepository,
  rating: 'low' | 'medium' | 'high',
): Promise<void> {
  const identified = new Date('2026-03-01T00:00:00.000Z');
  const customer = Customer.create('customer-1', aPersonIdentity(), identified);

  customer.rateRisk(rating, new Date('2026-03-02T00:00:00.000Z'));

  await customerRepository.save(customer);
}

function arrange() {
  const { commandBus, clock, dispatching } = createTestBuses({ idPrefix: 'customer' });
  // As the application hands it to the handler: the save announces the events of the customer to `domainEvents`.
  const customerRepository = dispatching(new FakeCustomerRepository());

  const handler = new ApproveHighRiskCustomerHandler(customerRepository, clock);

  commandBus.use(holders).register(ApproveHighRiskCustomerCommand, handler);

  return { commandBus, customerRepository, clock };
}
