import { describe, expect, it } from '@jest/globals';
import { AuthorizationMap, RoleBasedAuthorizer, authorizationMiddleware, requires } from '@ddd-ts-kit/auth';
import { anActor } from '@ddd-ts-kit/auth/testing';
import { createTestBuses } from '@ddd-ts-kit/testing';
import { financialCrimePermissions } from '@/contexts/financial-crime/financial-crime.permissions';
import { CloseAlertCommand } from '@/contexts/financial-crime/application/commands/close-alert/close-alert.command';
import { CloseAlertHandler } from '@/contexts/financial-crime/application/commands/close-alert/close-alert.handler';
import { FakeAlertRepository } from '@/contexts/financial-crime/test/fakes/alert.repository.fake';
import { anAlert } from '@/contexts/financial-crime/test/builders/alert.builder';

const holders = authorizationMiddleware({
  authorizer: new RoleBasedAuthorizer({
    roles: { holder: [financialCrimePermissions['alert.close']] },
  }),
  map: AuthorizationMap.of(requires(CloseAlertCommand, financialCrimePermissions['alert.close'])),
});

const holder = anActor().withRole('holder').build();

describe('Close alert', () => {
  it('closes the alert with the reason given and answers its identifier', async () => {
    const { commandBus, alertRepository } = await arrange();

    const id = await commandBus.execute(new CloseAlertCommand(holder, 'alert-1', 'Payer confirmed as the spouse'));

    expect(id).toBe('alert-1');
    expect((await alertRepository.findById(id))?.closureReason).toBe('Payer confirmed as the spouse');
  });

  it('refuses to close an alert that does not exist, with the code UNKNOWN_ALERT', async () => {
    const { commandBus } = await arrange();
    const command = new CloseAlertCommand(holder, 'alert-404', 'Reviewed');

    await expect(commandBus.execute(command)).rejects.toMatchObject({ code: 'UNKNOWN_ALERT' });
  });

  it('refuses to close an alert a second time, with the code ALERT_ALREADY_CLOSED', async () => {
    const { commandBus } = await arrange();

    await commandBus.execute(new CloseAlertCommand(holder, 'alert-1', 'Reviewed'));
    const command = new CloseAlertCommand(holder, 'alert-1', 'Reviewed again');

    await expect(commandBus.execute(command)).rejects.toMatchObject({ code: 'ALERT_ALREADY_CLOSED' });
  });

  it('is refused to an actor who does not hold the permission alert.close', async () => {
    const { commandBus } = await arrange();
    const command = new CloseAlertCommand(anActor().build(), 'alert-1', 'Reviewed');

    await expect(commandBus.execute(command)).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });
});

async function arrange() {
  const { commandBus, clock, dispatching, domainEvents } = createTestBuses({ idPrefix: 'alert' });
  // As the application hands it to the handler: the save announces the events of the alert to `domainEvents`.
  const alertRepository = dispatching(new FakeAlertRepository());

  await alertRepository.save(anAlert().identifiedBy('alert-1').build());

  const handler = new CloseAlertHandler(alertRepository, clock);

  commandBus.use(holders).register(CloseAlertCommand, handler);

  return { commandBus, alertRepository, domainEvents };
}
