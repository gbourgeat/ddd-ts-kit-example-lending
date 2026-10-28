import { describe, expect, it } from '@jest/globals';
import { AuthorizationMap, RoleBasedAuthorizer, authorizationMiddleware, requires } from '@ddd-ts-kit/auth';
import { anActor } from '@ddd-ts-kit/auth/testing';
import { createTestBuses } from '@ddd-ts-kit/testing';
import { servicingPermissions } from '@/contexts/servicing/servicing.permissions';
import { ErasePersonalDataPastRetentionCommand } from '@/contexts/servicing/ledger/application/commands/erase-personal-data-past-retention/erase-personal-data-past-retention.command';
import { ErasePersonalDataPastRetentionHandler } from '@/contexts/servicing/ledger/application/commands/erase-personal-data-past-retention/erase-personal-data-past-retention.handler';

const holders = authorizationMiddleware({
  authorizer: new RoleBasedAuthorizer({
    roles: { holder: [servicingPermissions['loan.erase-past-retention']] },
  }),
  map: AuthorizationMap.of(
    requires(ErasePersonalDataPastRetentionCommand, servicingPermissions['loan.erase-past-retention']),
  ),
});

const holder = anActor().withRole('holder').build();

describe('Erase personal data past retention', () => {
  it('erases nothing while no loan has been paid out', async () => {
    const commandBus = arrange();

    expect(await commandBus.execute(new ErasePersonalDataPastRetentionCommand(holder))).toBe('0');
  });

  it('is refused to an actor who does not hold the permission loan.erase-past-retention', async () => {
    const commandBus = arrange();

    await expect(
      commandBus.execute(new ErasePersonalDataPastRetentionCommand(anActor().build())),
    ).rejects.toMatchObject({
      code: 'FORBIDDEN',
    });
  });
});

function arrange() {
  const { commandBus } = createTestBuses({ idPrefix: 'loan' });

  commandBus.use(holders).register(ErasePersonalDataPastRetentionCommand, new ErasePersonalDataPastRetentionHandler());

  return commandBus;
}
