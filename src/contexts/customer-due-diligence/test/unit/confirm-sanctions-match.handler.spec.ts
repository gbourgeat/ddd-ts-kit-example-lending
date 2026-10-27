import { describe, expect, it } from '@jest/globals';
import { AuthorizationMap, RoleBasedAuthorizer, authorizationMiddleware, requires } from '@ddd-ts-kit/auth';
import { anActor } from '@ddd-ts-kit/auth/testing';
import { createTestBuses } from '@ddd-ts-kit/testing';
import { customerDueDiligencePermissions } from '@/contexts/customer-due-diligence/customer-due-diligence.permissions';
import { ConfirmSanctionsMatchCommand } from '@/contexts/customer-due-diligence/application/commands/confirm-sanctions-match/confirm-sanctions-match.command';
import { ConfirmSanctionsMatchHandler } from '@/contexts/customer-due-diligence/application/commands/confirm-sanctions-match/confirm-sanctions-match.handler';
import { Customer } from '@/contexts/customer-due-diligence/domain/aggregates/customer.aggregate';
import { FakeCustomerRepository } from '@/contexts/customer-due-diligence/test/fakes/customer.repository.fake';
import { aPersonIdentity } from '@/contexts/customer-due-diligence/test/builders/customer.builder';

const holders = authorizationMiddleware({
  authorizer: new RoleBasedAuthorizer({
    roles: { holder: [customerDueDiligencePermissions['match.confirm']] },
  }),
  map: AuthorizationMap.of(requires(ConfirmSanctionsMatchCommand, customerDueDiligencePermissions['match.confirm'])),
});

const holder = anActor().withRole('holder').build();
const identifiedOn = new Date('2026-01-10T00:00:00.000Z');

describe('Confirm sanctions match', () => {
  it('confirms the possible match waiting for review, and answers the customer identifier', async () => {
    const { commandBus, customerRepository } = arrange();

    await saveWithPossibleMatch(customerRepository, 'acme');

    const id = await commandBus.execute(new ConfirmSanctionsMatchCommand(holder, 'acme'));

    expect(id).toBe('acme');
    expect((await customerRepository.findById('acme'))?.toState().sanctionsMatchConfirmedAt).toBeDefined();
  });

  it('refuses to confirm a customer whose screening found no possible match, and saves nothing', async () => {
    const { commandBus, customerRepository } = arrange();

    await customerRepository.save(Customer.create('acme', aPersonIdentity(), identifiedOn));

    await expect(commandBus.execute(new ConfirmSanctionsMatchCommand(holder, 'acme'))).rejects.toMatchObject({
      code: 'NO_POSSIBLE_MATCH',
    });

    expect((await customerRepository.findById('acme'))?.toState().sanctionsMatchConfirmedAt).toBeUndefined();
  });

  it('refuses to confirm an unknown customer', async () => {
    const { commandBus } = arrange();

    await expect(commandBus.execute(new ConfirmSanctionsMatchCommand(holder, 'unknown'))).rejects.toMatchObject({
      code: 'UNKNOWN_CUSTOMER',
    });
  });

  it('is refused to an actor who does not hold the permission match.confirm', async () => {
    const { commandBus } = arrange();
    const command = new ConfirmSanctionsMatchCommand(anActor().build(), 'acme');

    await expect(commandBus.execute(command)).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });
});

/** A customer identified and screened, whose possible match waits for compliance review. */
async function saveWithPossibleMatch(customerRepository: FakeCustomerRepository, id: string): Promise<void> {
  const screened = Customer.create(id, aPersonIdentity(), identifiedOn);

  screened.recordPossibleMatch(identifiedOn);

  await customerRepository.save(screened);
}

function arrange() {
  const { commandBus, clock, dispatching } = createTestBuses({ idPrefix: 'customer' });
  const customerRepository = dispatching(new FakeCustomerRepository());

  const handler = new ConfirmSanctionsMatchHandler(customerRepository, clock);

  commandBus.use(holders).register(ConfirmSanctionsMatchCommand, handler);

  return { commandBus, customerRepository };
}
