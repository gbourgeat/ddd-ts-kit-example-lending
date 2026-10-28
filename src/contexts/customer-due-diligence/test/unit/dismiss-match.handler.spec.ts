import { describe, expect, it } from '@jest/globals';
import { AuthorizationMap, RoleBasedAuthorizer, authorizationMiddleware, requires } from '@ddd-ts-kit/auth';
import { anActor } from '@ddd-ts-kit/auth/testing';
import { createTestBuses } from '@ddd-ts-kit/testing';
import { customerDueDiligencePermissions } from '@/contexts/customer-due-diligence/customer-due-diligence.permissions';
import { DismissMatchCommand } from '@/contexts/customer-due-diligence/application/commands/dismiss-match/dismiss-match.command';
import { DismissMatchHandler } from '@/contexts/customer-due-diligence/application/commands/dismiss-match/dismiss-match.handler';
import { FakeCustomerRepository } from '@/contexts/customer-due-diligence/test/fakes/customer.repository.fake';

const holders = authorizationMiddleware({
  authorizer: new RoleBasedAuthorizer({
    roles: { holder: [customerDueDiligencePermissions['match.dismiss']] },
  }),
  map: AuthorizationMap.of(requires(DismissMatchCommand, customerDueDiligencePermissions['match.dismiss'])),
});

const holder = anActor().withRole('holder').build();

describe('Dismiss match', () => {
  it('refuses to dismiss the match of an unknown customer', async () => {
    const { commandBus } = arrange();
    const command = new DismissMatchCommand(holder, 'unknown', 'Not the listed person');

    await expect(commandBus.execute(command)).rejects.toMatchObject({ code: 'UNKNOWN_CUSTOMER' });
  });

  it('is refused to an actor who does not hold the permission match.dismiss', async () => {
    const { commandBus } = arrange();
    const command = new DismissMatchCommand(anActor().build(), 'customer-1', 'Not the listed person');

    await expect(commandBus.execute(command)).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });
});

function arrange() {
  const { commandBus, clock, ids, dispatching } = createTestBuses({ idPrefix: 'customer' });
  // As the application hands it to the handler: the save announces the events of the customer.
  const customerRepository = dispatching(new FakeCustomerRepository());

  const handler = new DismissMatchHandler(customerRepository, clock);

  commandBus.use(holders).register(DismissMatchCommand, handler);

  return { commandBus, customerRepository, ids };
}
