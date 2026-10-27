import { describe, expect, it } from '@jest/globals';
import { AuthorizationMap, RoleBasedAuthorizer, authorizationMiddleware, requires } from '@ddd-ts-kit/auth';
import { anActor } from '@ddd-ts-kit/auth/testing';
import { createTestBuses } from '@ddd-ts-kit/testing';
import { customerDueDiligencePermissions } from '@/contexts/customer-due-diligence/customer-due-diligence.permissions';
import { DeclareDirectorsAndOwnersCommand } from '@/contexts/customer-due-diligence/application/commands/declare-directors-and-owners/declare-directors-and-owners.command';
import { DeclareDirectorsAndOwnersHandler } from '@/contexts/customer-due-diligence/application/commands/declare-directors-and-owners/declare-directors-and-owners.handler';
import { FakeCustomerRepository } from '@/contexts/customer-due-diligence/test/fakes/customer.repository.fake';
import { Customer } from '@/contexts/customer-due-diligence/domain/aggregates/customer.aggregate';
import { aPersonIdentity } from '@/contexts/customer-due-diligence/test/builders/customer.builder';

const holders = authorizationMiddleware({
  authorizer: new RoleBasedAuthorizer({
    roles: { holder: [customerDueDiligencePermissions['business.declare-owners']] },
  }),
  map: AuthorizationMap.of(
    requires(DeclareDirectorsAndOwnersCommand, customerDueDiligencePermissions['business.declare-owners']),
  ),
});

const holder = anActor().withRole('holder').build();

const registrationDate = new Date('2026-01-10T00:00:00.000Z');

describe('Declare directors and owners', () => {
  it('saves the business owners declared on the registered business, and answers the customer identifier', async () => {
    const { commandBus, customerRepository } = arrange();

    await registeredCustomer(customerRepository);

    const id = await commandBus.execute(
      declare([aPersonIdentity({ documentNumber: 'DIRECTOR-1' })], [aPersonIdentity({ documentNumber: 'OWNER-1' })]),
    );

    expect(id).toBe('acme');
    expect((await customerRepository.findById(id))?.toState().ownersDeclaredAt).toBeDefined();
  });

  it('is refused to an actor who does not hold the permission business.declare-owners', async () => {
    const { commandBus } = arrange();
    const command = new DeclareDirectorsAndOwnersCommand(anActor().build(), 'acme', [aPersonIdentity()], []);

    await expect(commandBus.execute(command)).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });

  it('refuses the owners of a customer whose business is not registered yet, and saves nothing', async () => {
    const { commandBus, customerRepository } = arrange();

    await customerRepository.save(Customer.create('acme', aPersonIdentity(), registrationDate));

    await expect(commandBus.execute(declare([aPersonIdentity()], []))).rejects.toMatchObject({
      code: 'BUSINESS_NOT_REGISTERED',
    });

    expect((await customerRepository.findById('acme'))?.toState().ownersDeclaredAt).toBeUndefined();
  });

  it('refuses an unknown customer', async () => {
    const { commandBus } = arrange();

    await expect(commandBus.execute(declare([aPersonIdentity()], []))).rejects.toMatchObject({
      code: 'UNKNOWN_CUSTOMER',
    });
  });

  it('refuses a beneficial owner whose identity document is expired, and saves nothing', async () => {
    const { commandBus, customerRepository } = arrange();

    await registeredCustomer(customerRepository);
    const expired = aPersonIdentity({ documentExpiresOn: new Date('2000-01-01T00:00:00.000Z') });

    await expect(commandBus.execute(declare([], [expired]))).rejects.toMatchObject({
      code: 'IDENTITY_DOCUMENT_EXPIRED',
    });

    expect((await customerRepository.findById('acme'))?.toState().ownersDeclaredAt).toBeUndefined();
  });

  it('refuses a director whose proof of address is too old, and saves nothing', async () => {
    const { commandBus, customerRepository } = arrange();

    await registeredCustomer(customerRepository);
    const stale = aPersonIdentity({ addressProofDatedOn: new Date('2000-01-01T00:00:00.000Z') });

    await expect(commandBus.execute(declare([stale], []))).rejects.toMatchObject({
      code: 'PROOF_OF_ADDRESS_TOO_OLD',
    });

    expect((await customerRepository.findById('acme'))?.toState().ownersDeclaredAt).toBeUndefined();
  });
});

function declare(
  directors: ReturnType<typeof aPersonIdentity>[],
  beneficialOwners: ReturnType<typeof aPersonIdentity>[],
) {
  return new DeclareDirectorsAndOwnersCommand(holder, 'acme', directors, beneficialOwners);
}

async function registeredCustomer(customerRepository: FakeCustomerRepository): Promise<void> {
  const customer = Customer.create('acme', aPersonIdentity(), registrationDate);

  customer.registerBusiness(
    {
      legalName: 'Acme SAS',
      registrationNumber: '123456789',
      countryOfRegistration: 'FR',
      registeredOn: registrationDate,
    },
    registrationDate,
  );

  await customerRepository.save(customer);
}

function arrange() {
  const { commandBus, clock, dispatching } = createTestBuses({ idPrefix: 'customer' });
  // As the application hands it to the handler: the save announces the events of the customer.
  const customerRepository = dispatching(new FakeCustomerRepository());

  const handler = new DeclareDirectorsAndOwnersHandler(customerRepository, clock);

  commandBus.use(holders).register(DeclareDirectorsAndOwnersCommand, handler);

  return { commandBus, customerRepository };
}
