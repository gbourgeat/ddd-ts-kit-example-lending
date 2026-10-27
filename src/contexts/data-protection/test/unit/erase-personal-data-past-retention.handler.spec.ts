import { describe, expect, it } from '@jest/globals';
import { AuthorizationMap, RoleBasedAuthorizer, authorizationMiddleware, requires } from '@ddd-ts-kit/auth';
import { anActor } from '@ddd-ts-kit/auth/testing';
import { createTestBuses } from '@ddd-ts-kit/testing';
import { dataProtectionPermissions } from '@/contexts/data-protection/data-protection.permissions';
import { ErasePersonalDataPastRetentionCommand } from '@/contexts/data-protection/application/commands/erase-personal-data-past-retention/erase-personal-data-past-retention.command';
import { ErasePersonalDataPastRetentionHandler } from '@/contexts/data-protection/application/commands/erase-personal-data-past-retention/erase-personal-data-past-retention.handler';
import { FakePersonalDataPurge } from '@/contexts/data-protection/test/fakes/personal-data-purge.fake';

const holders = authorizationMiddleware({
  authorizer: new RoleBasedAuthorizer({
    roles: { holder: [dataProtectionPermissions['data.erase']] },
  }),
  map: AuthorizationMap.of(requires(ErasePersonalDataPastRetentionCommand, dataProtectionPermissions['data.erase'])),
});

const holder = anActor().withRole('holder').build();

describe('Erase personal data past retention', () => {
  it('asks the purge of every context to run and answers the rows it reached', async () => {
    const { commandBus, purge } = arrange(7);

    const purged = await commandBus.execute(new ErasePersonalDataPastRetentionCommand(holder));

    expect(purged).toBe(7);
    expect(purge.purges).toBe(1);
  });

  it('is refused to an actor who does not hold the permission data.erase, and asks no context', async () => {
    const { commandBus, purge } = arrange(7);
    const command = new ErasePersonalDataPastRetentionCommand(anActor().build());

    await expect(commandBus.execute(command)).rejects.toMatchObject({ code: 'FORBIDDEN' });
    expect(purge.purges).toBe(0);
  });
});

function arrange(rowsPurged: number) {
  const { commandBus } = createTestBuses({ idPrefix: 'retention-period' });
  const purge = new FakePersonalDataPurge(rowsPurged);

  commandBus
    .use(holders)
    .register(ErasePersonalDataPastRetentionCommand, new ErasePersonalDataPastRetentionHandler(purge));

  return { commandBus, purge };
}
