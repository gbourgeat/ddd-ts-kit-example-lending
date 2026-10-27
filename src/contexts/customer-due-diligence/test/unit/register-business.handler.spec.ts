import { describe, expect, it } from '@jest/globals';
import { AuthorizationMap, RoleBasedAuthorizer, authorizationMiddleware, requires } from '@ddd-ts-kit/auth';
import { anActor } from '@ddd-ts-kit/auth/testing';
import { createTestBuses } from '@ddd-ts-kit/testing';
import { customerDueDiligencePermissions } from '@/contexts/customer-due-diligence/customer-due-diligence.permissions';
import { CustomerBusinessRegistered } from '@/contexts/customer-due-diligence/domain/events/customer-business-registered.event';
import { RegisterBusinessCommand } from '@/contexts/customer-due-diligence/application/commands/register-business/register-business.command';
import { RegisterBusinessHandler } from '@/contexts/customer-due-diligence/application/commands/register-business/register-business.handler';
import { FakeCustomerRepository } from '@/contexts/customer-due-diligence/test/fakes/customer.repository.fake';
import { Customer } from '@/contexts/customer-due-diligence/domain/aggregates/customer.aggregate';
import { aPersonIdentity } from '@/contexts/customer-due-diligence/test/builders/customer.builder';

const holders = authorizationMiddleware({
  authorizer: new RoleBasedAuthorizer({
    roles: { holder: [customerDueDiligencePermissions['business.register']] },
  }),
  map: AuthorizationMap.of(requires(RegisterBusinessCommand, customerDueDiligencePermissions['business.register'])),
});

const holder = anActor().withRole('holder').build();
const registeredOn = new Date('2026-02-14T00:00:00.000Z');

describe('Register business', () => {
  it('records the business of a known customer, and saves it with the facts of its registration', async () => {
    const { commandBus, customerRepository } = await arrange();

    await commandBus.execute(registration('customer-1'));
    const saved = await customerRepository.findById('customer-1');

    expect(saved?.toState().business).toEqual({
      legalName: 'Boulangerie Dupont SARL',
      registrationNumber: 'RC-75-123',
      countryOfRegistration: 'FR',
      registeredOn,
    });
  });

  it('announces the registration of the business once it is saved', async () => {
    const { commandBus, domainEvents } = await arrange();
    const announced: CustomerBusinessRegistered[] = [];

    domainEvents.on(CustomerBusinessRegistered.eventName, async (event) => {
      announced.push(event as CustomerBusinessRegistered);
    });

    await commandBus.execute(registration('customer-1'));

    expect(announced.map((event) => event.aggregateId)).toEqual(['customer-1']);
  });

  it('answers the identifier of the customer whose business is registered', async () => {
    const { commandBus } = await arrange();

    const id = await commandBus.execute(registration('customer-1'));

    expect(id).toBe('customer-1');
  });

  it('refuses a registration for a customer that is not known, with the code UNKNOWN_CUSTOMER', async () => {
    const { commandBus } = await arrange();

    await expect(commandBus.execute(registration('customer-404'))).rejects.toMatchObject({
      code: 'UNKNOWN_CUSTOMER',
    });
  });

  it('refuses a second registration of the business, with the code BUSINESS_ALREADY_REGISTERED', async () => {
    const { commandBus } = await arrange();

    await commandBus.execute(registration('customer-1'));

    await expect(commandBus.execute(registration('customer-1', 'Autre SARL'))).rejects.toMatchObject({
      code: 'BUSINESS_ALREADY_REGISTERED',
    });
  });

  it('keeps the first business and announces nothing more when a second registration is refused', async () => {
    const { commandBus, customerRepository, domainEvents } = await arrange();
    const announced: CustomerBusinessRegistered[] = [];

    domainEvents.on(CustomerBusinessRegistered.eventName, async (event) => {
      announced.push(event as CustomerBusinessRegistered);
    });

    await commandBus.execute(registration('customer-1'));

    await commandBus.execute(registration('customer-1', 'Autre SARL')).catch(() => undefined);
    const saved = await customerRepository.findById('customer-1');

    expect(saved?.toState().business?.legalName).toBe('Boulangerie Dupont SARL');
    expect(announced).toHaveLength(1);
  });

  it('is refused to an actor who does not hold the permission business.register', async () => {
    const { commandBus } = await arrange();

    const command = new RegisterBusinessCommand(
      anActor().build(),
      'customer-1',
      'Boulangerie Dupont SARL',
      'RC-75-123',
      'FR',
      registeredOn,
    );

    await expect(commandBus.execute(command)).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });
});

function registration(customerId: string, legalName = 'Boulangerie Dupont SARL'): RegisterBusinessCommand {
  return new RegisterBusinessCommand(holder, customerId, legalName, 'RC-75-123', 'FR', registeredOn);
}

async function arrange() {
  const { commandBus, clock, dispatching, domainEvents } = createTestBuses({ idPrefix: 'customer' });
  // As the application hands it to the handler: the save announces the events of the customer to `domainEvents`.
  const customerRepository = dispatching(new FakeCustomerRepository());

  // A customer the bank already knows: its identity was recorded before its business is registered.
  await customerRepository.save(Customer.create('customer-1', aPersonIdentity(), clock.now()));

  const handler = new RegisterBusinessHandler(customerRepository, clock);

  commandBus.use(holders).register(RegisterBusinessCommand, handler);

  return { commandBus, customerRepository, domainEvents };
}
