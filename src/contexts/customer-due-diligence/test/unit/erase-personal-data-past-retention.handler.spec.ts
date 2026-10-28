import { describe, expect, it } from '@jest/globals';
import { AuthorizationMap, RoleBasedAuthorizer, authorizationMiddleware, requires } from '@ddd-ts-kit/auth';
import { anActor } from '@ddd-ts-kit/auth/testing';
import { createTestBuses } from '@ddd-ts-kit/testing';
import { customerDueDiligencePermissions } from '@/contexts/customer-due-diligence/customer-due-diligence.permissions';
import { Customer } from '@/contexts/customer-due-diligence/domain/aggregates/customer.aggregate';
import type { CustomerRepository } from '@/contexts/customer-due-diligence/domain/repositories/customer.repository';
import { aPersonIdentity } from '@/contexts/customer-due-diligence/test/builders/customer.builder';
import { ErasePersonalDataPastRetentionCommand } from '@/contexts/customer-due-diligence/application/commands/erase-personal-data-past-retention/erase-personal-data-past-retention.command';
import { ErasePersonalDataPastRetentionHandler } from '@/contexts/customer-due-diligence/application/commands/erase-personal-data-past-retention/erase-personal-data-past-retention.handler';
import { FakeCustomerRepository } from '@/contexts/customer-due-diligence/test/fakes/customer.repository.fake';
import { FakePersonalDataErasure } from '@/contexts/customer-due-diligence/test/fakes/personal-data-erasure.fake';

const holders = authorizationMiddleware({
  authorizer: new RoleBasedAuthorizer({
    roles: { holder: [customerDueDiligencePermissions['customer.erase-past-retention']] },
  }),
  map: AuthorizationMap.of(
    requires(ErasePersonalDataPastRetentionCommand, customerDueDiligencePermissions['customer.erase-past-retention']),
  ),
});

const holder = anActor().withRole('holder').build();

const endedLongAgo = new Date('2020-01-10T03:00:00.000Z');
const endedFiveYearsBefore = new Date('2021-01-10T03:00:00.000Z');
const endedRecently = new Date('2024-06-01T03:00:00.000Z');
const asOf = new Date('2026-01-10T03:00:00.000Z');

describe('Erase personal data past retention', () => {
  it('erases the personal data of a customer whose relationship ended more than five years before the day', async () => {
    const { commandBus, customerRepository, erasure } = arrange();

    await endedCustomer(customerRepository, 'customer-1', endedLongAgo);

    await commandBus.execute(new ErasePersonalDataPastRetentionCommand(holder, asOf));

    expect(erasure.erased).toEqual(['customer-1']);
  });

  it('erases a customer whose relationship ended exactly five years before the day', async () => {
    const { commandBus, customerRepository, erasure } = arrange();

    await endedCustomer(customerRepository, 'customer-1', endedFiveYearsBefore);

    await commandBus.execute(new ErasePersonalDataPastRetentionCommand(holder, asOf));

    expect(erasure.erased).toEqual(['customer-1']);
  });

  it('keeps the personal data of a customer whose relationship ended less than five years before the day', async () => {
    const { commandBus, customerRepository, erasure } = arrange();

    await endedCustomer(customerRepository, 'customer-1', endedRecently);

    await commandBus.execute(new ErasePersonalDataPastRetentionCommand(holder, asOf));

    expect(erasure.erased).toEqual([]);
  });

  it('keeps the personal data of a customer whose relationship has not ended', async () => {
    const { commandBus, customerRepository, erasure } = arrange();

    await identifiedCustomer(customerRepository, 'customer-1');

    await commandBus.execute(new ErasePersonalDataPastRetentionCommand(holder, asOf));

    expect(erasure.erased).toEqual([]);
  });

  it('judges the retention by the day the command gives, not by the clock', async () => {
    const { commandBus, customerRepository, erasure } = arrange();

    await endedCustomer(customerRepository, 'customer-1', endedLongAgo);

    await commandBus.execute(new ErasePersonalDataPastRetentionCommand(holder, new Date('2024-01-01T03:00:00.000Z')));
    expect(erasure.erased).toEqual([]);

    await commandBus.execute(new ErasePersonalDataPastRetentionCommand(holder, asOf));
    expect(erasure.erased).toEqual(['customer-1']);
  });

  it('erases the same customer again, without failing, when the command runs twice', async () => {
    const { commandBus, customerRepository, erasure } = arrange();

    await endedCustomer(customerRepository, 'customer-1', endedLongAgo);

    await commandBus.execute(new ErasePersonalDataPastRetentionCommand(holder, asOf));
    await expect(commandBus.execute(new ErasePersonalDataPastRetentionCommand(holder, asOf))).resolves.toBeUndefined();

    expect(erasure.erased).toEqual(['customer-1', 'customer-1']);
  });

  it('is refused to an actor who does not hold the permission customer.erase-past-retention', async () => {
    const { commandBus } = arrange();
    const command = new ErasePersonalDataPastRetentionCommand(anActor().build(), asOf);

    await expect(commandBus.execute(command)).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });
});

/** A customer identified on the day, whose relationship ended on the given day. */
async function endedCustomer(repository: CustomerRepository, id: string, endedOn: Date): Promise<void> {
  const customer = Customer.create(id, aPersonIdentity(), endedOn);

  customer.endRelationship(endedOn);
  await repository.save(customer);
}

async function identifiedCustomer(repository: CustomerRepository, id: string): Promise<void> {
  await repository.save(Customer.create(id, aPersonIdentity(), endedLongAgo));
}

function arrange() {
  const { commandBus, dispatching } = createTestBuses({ idPrefix: 'customer' });
  // As the application hands it to the handler: the save announces the events of the customer to `domainEvents`.
  const customerRepository = dispatching(new FakeCustomerRepository());
  const erasure = new FakePersonalDataErasure();

  const handler = new ErasePersonalDataPastRetentionHandler(customerRepository, erasure);

  commandBus.use(holders).register(ErasePersonalDataPastRetentionCommand, handler);

  return { commandBus, customerRepository, erasure };
}
