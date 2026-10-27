import { describe, expect, it } from '@jest/globals';
import { AuthorizationMap, RoleBasedAuthorizer, authorizationMiddleware, requires } from '@ddd-ts-kit/auth';
import { anActor } from '@ddd-ts-kit/auth/testing';
import { createTestBuses } from '@ddd-ts-kit/testing';
import { customerDueDiligencePermissions } from '@/contexts/customer-due-diligence/customer-due-diligence.permissions';
import { IdentifyCustomerCommand } from '@/contexts/customer-due-diligence/application/commands/identify-customer/identify-customer.command';
import { IdentifyCustomerHandler } from '@/contexts/customer-due-diligence/application/commands/identify-customer/identify-customer.handler';
import { FakeCustomerRepository } from '@/contexts/customer-due-diligence/test/fakes/customer.repository.fake';
import { IdentityDocumentKind } from '@/contexts/customer-due-diligence/domain/vocabularies/identity-document-kind.vocabulary';
import type { PersonIdentity } from '@/contexts/customer-due-diligence/domain/events/customer-identified.event';

const holders = authorizationMiddleware({
  authorizer: new RoleBasedAuthorizer({
    roles: { holder: [customerDueDiligencePermissions['customer.identify']] },
  }),
  map: AuthorizationMap.of(requires(IdentifyCustomerCommand, customerDueDiligencePermissions['customer.identify'])),
});

const holder = anActor().withRole('holder').build();

const now = new Date('2026-06-01T00:00:00.000Z');

const validIdentity: PersonIdentity = {
  documentKind: IdentityDocumentKind.Passport,
  documentNumber: '12AB34567',
  issuingCountry: 'FR',
  documentExpiresOn: new Date('2030-01-01T00:00:00.000Z'),
  address: '1 rue de la Paix, 75002 Paris',
  addressProofDatedOn: new Date('2026-05-01T00:00:00.000Z'),
};

describe('Identify customer', () => {
  it('saves the person identified with the checked identity, and answers its identifier', async () => {
    const { commandBus, customerRepository } = arrange();

    const id = await commandBus.execute(identify(validIdentity));

    expect(id).toBe('customer-1');
    expect(await customerRepository.findById(id)).toBeDefined();
  });

  it('is refused to an actor who does not hold the permission customer.identify', async () => {
    const { commandBus } = arrange();

    const command = new IdentifyCustomerCommand(
      anActor().build(),
      validIdentity.documentKind,
      validIdentity.documentNumber,
      validIdentity.issuingCountry,
      validIdentity.documentExpiresOn,
      validIdentity.address,
      validIdentity.addressProofDatedOn,
    );

    await expect(commandBus.execute(command)).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });

  it('refuses a person whose identity document is expired on the day, and saves nothing', async () => {
    const { commandBus, customerRepository } = arrange();

    await expect(
      commandBus.execute(identify({ ...validIdentity, documentExpiresOn: new Date('2026-05-31T00:00:00.000Z') })),
    ).rejects.toMatchObject({ code: 'IDENTITY_DOCUMENT_EXPIRED' });

    expect(await customerRepository.findById('customer-1')).toBeUndefined();
  });

  it('refuses a person whose proof of address is older than three months, and saves nothing', async () => {
    const { commandBus, customerRepository } = arrange();

    await expect(
      commandBus.execute(identify({ ...validIdentity, addressProofDatedOn: new Date('2026-02-28T00:00:00.000Z') })),
    ).rejects.toMatchObject({ code: 'PROOF_OF_ADDRESS_TOO_OLD' });

    expect(await customerRepository.findById('customer-1')).toBeUndefined();
  });
});

function identify(identity: PersonIdentity): IdentifyCustomerCommand {
  return new IdentifyCustomerCommand(
    holder,
    identity.documentKind,
    identity.documentNumber,
    identity.issuingCountry,
    identity.documentExpiresOn,
    identity.address,
    identity.addressProofDatedOn,
  );
}

function arrange() {
  const { commandBus, clock, ids, dispatching, domainEvents } = createTestBuses({ idPrefix: 'customer', now });
  // As the application hands it to the handler: the save announces the events of the customer to `domainEvents`.
  const customerRepository = dispatching(new FakeCustomerRepository());

  const handler = new IdentifyCustomerHandler(customerRepository, ids, clock);

  commandBus.use(holders).register(IdentifyCustomerCommand, handler);

  return { commandBus, customerRepository, domainEvents };
}
