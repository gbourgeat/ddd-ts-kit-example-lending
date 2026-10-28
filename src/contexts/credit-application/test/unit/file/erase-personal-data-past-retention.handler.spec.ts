import { describe, expect, it } from '@jest/globals';
import { AuthorizationMap, RoleBasedAuthorizer, authorizationMiddleware, requires } from '@ddd-ts-kit/auth';
import { anActor } from '@ddd-ts-kit/auth/testing';
import { createTestBuses } from '@ddd-ts-kit/testing';
import { creditApplicationPermissions } from '@/contexts/credit-application/credit-application.permissions';
import { ErasePersonalDataPastRetentionCommand } from '@/contexts/credit-application/file/application/commands/erase-personal-data-past-retention/erase-personal-data-past-retention.command';
import { ErasePersonalDataPastRetentionHandler } from '@/contexts/credit-application/file/application/commands/erase-personal-data-past-retention/erase-personal-data-past-retention.handler';

const holders = authorizationMiddleware({
  authorizer: new RoleBasedAuthorizer({
    roles: { holder: [creditApplicationPermissions['application.erase-past-retention']] },
  }),
  map: AuthorizationMap.of(
    requires(ErasePersonalDataPastRetentionCommand, creditApplicationPermissions['application.erase-past-retention']),
  ),
});

const holder = anActor().withRole('holder').build();

describe('Erase personal data past retention', () => {
  it('erases nothing while no application has been refused', async () => {
    const commandBus = arrange();

    expect(await commandBus.execute(new ErasePersonalDataPastRetentionCommand(holder))).toBe('0');
  });

  it('is refused to an actor who does not hold the permission application.erase-past-retention', async () => {
    const commandBus = arrange();
    const command = new ErasePersonalDataPastRetentionCommand(anActor().build());

    await expect(commandBus.execute(command)).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });
});

function arrange() {
  const { commandBus } = createTestBuses({ idPrefix: 'credit-application' });

  commandBus.use(holders).register(ErasePersonalDataPastRetentionCommand, new ErasePersonalDataPastRetentionHandler());

  return commandBus;
}
