import { describe, expect, it } from '@jest/globals';
import { AuthorizationMap, RoleBasedAuthorizer, authorizationMiddleware, requires } from '@ddd-ts-kit/auth';
import { anActor } from '@ddd-ts-kit/auth/testing';
import { createTestBuses } from '@ddd-ts-kit/testing';
import { customerDueDiligencePermissions } from '@/contexts/customer-due-diligence/customer-due-diligence.permissions';
import { ScreenCustomerCommand } from '@/contexts/customer-due-diligence/application/commands/screen-customer/screen-customer.command';
import { ScreenCustomerHandler } from '@/contexts/customer-due-diligence/application/commands/screen-customer/screen-customer.handler';
import { Customer } from '@/contexts/customer-due-diligence/domain/aggregates/customer.aggregate';
import { FakeCustomerRepository } from '@/contexts/customer-due-diligence/test/fakes/customer.repository.fake';
import { FakeScreeningProvider } from '@/contexts/customer-due-diligence/test/fakes/screening-provider.fake';
import { aPersonIdentity } from '@/contexts/customer-due-diligence/test/builders/customer.builder';

const holders = authorizationMiddleware({
  authorizer: new RoleBasedAuthorizer({
    roles: { holder: [customerDueDiligencePermissions['customer.screen']] },
  }),
  map: AuthorizationMap.of(requires(ScreenCustomerCommand, customerDueDiligencePermissions['customer.screen'])),
});

const holder = anActor().withRole('holder').build();
const identifiedOn = new Date('2026-01-10T00:00:00.000Z');
const birthDate = new Date('1980-05-01T00:00:00.000Z');

describe('Screen customer', () => {
  it('records a possible match when the lists hold the person, for compliance to review', async () => {
    const { commandBus, customerRepository, screeningProvider } = arrange();

    screeningProvider.markPossibleMatch('Ada Lovelace');
    await customerRepository.save(Customer.create('acme', aPersonIdentity(), identifiedOn));

    await commandBus.execute(new ScreenCustomerCommand(holder, 'acme', 'Ada Lovelace', birthDate));

    expect((await customerRepository.findById('acme'))?.toState().possibleMatchFoundAt).toBeDefined();
  });

  it('records no match when the lists hold nobody of that name, and still screens the person', async () => {
    const { commandBus, customerRepository, screeningProvider } = arrange();

    await customerRepository.save(Customer.create('acme', aPersonIdentity(), identifiedOn));

    await commandBus.execute(new ScreenCustomerCommand(holder, 'acme', 'Grace Hopper', birthDate));

    expect((await customerRepository.findById('acme'))?.toState().possibleMatchFoundAt).toBeUndefined();
    expect(screeningProvider.screened.map((entry) => entry.name)).toEqual(['Grace Hopper']);
  });

  it('refuses to screen an unknown customer, and screens nobody', async () => {
    const { commandBus, screeningProvider } = arrange();

    await expect(
      commandBus.execute(new ScreenCustomerCommand(holder, 'unknown', 'Ada Lovelace', birthDate)),
    ).rejects.toMatchObject({ code: 'UNKNOWN_CUSTOMER' });

    expect(screeningProvider.screened).toEqual([]);
  });

  it('is refused to an actor who does not hold the permission customer.screen', async () => {
    const { commandBus } = arrange();
    const command = new ScreenCustomerCommand(anActor().build(), 'acme', 'Ada Lovelace', birthDate);

    await expect(commandBus.execute(command)).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });
});

function arrange() {
  const { commandBus, clock, dispatching } = createTestBuses({ idPrefix: 'customer' });
  const customerRepository = dispatching(new FakeCustomerRepository());
  const screeningProvider = new FakeScreeningProvider();

  commandBus
    .use(holders)
    .register(ScreenCustomerCommand, new ScreenCustomerHandler(customerRepository, screeningProvider, clock));

  return { commandBus, customerRepository, screeningProvider };
}
