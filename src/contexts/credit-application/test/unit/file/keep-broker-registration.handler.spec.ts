import { describe, expect, it } from '@jest/globals';
import { AuthorizationMap, RoleBasedAuthorizer, authorizationMiddleware, requires } from '@ddd-ts-kit/auth';
import { anActor } from '@ddd-ts-kit/auth/testing';
import { createTestBuses } from '@ddd-ts-kit/testing';
import { stampOf, type Actor } from '@ddd-ts-kit/kernel';
import { brokerRegisteredV1 } from '@/contexts/brokerage/published-language';
import { creditApplicationPermissions } from '@/contexts/credit-application/credit-application.permissions';
import { KeepBrokerRegistrationCommand } from '@/contexts/credit-application/file/application/commands/keep-broker-registration/keep-broker-registration.command';
import { KeepBrokerRegistrationHandler } from '@/contexts/credit-application/file/application/commands/keep-broker-registration/keep-broker-registration.handler';
import { FakeBrokerRegistrations } from '@/contexts/credit-application/test/fakes/broker-registrations.fake';

const holders = authorizationMiddleware({
  authorizer: new RoleBasedAuthorizer({
    roles: { holder: [creditApplicationPermissions['broker-registration.keep']] },
  }),
  map: AuthorizationMap.of(
    requires(KeepBrokerRegistrationCommand, creditApplicationPermissions['broker-registration.keep']),
  ),
});

const holder = anActor().withRole('holder').build();

describe('Keep broker registration', () => {
  it('keeps the registration of the broker in force from the instant it was registered', async () => {
    const { commandBus, registrations } = arrange();

    await commandBus.execute(keepCommand(holder, 'broker-1', true, '2026-01-01T00:00:00.000Z'));

    expect(await registrations.get('broker-1')).toMatchObject({ brokerId: 'broker-1', inForce: true });
  });

  it('keeps the registration lapsed when a later event says it lapsed', async () => {
    const { commandBus, registrations } = arrange();

    await commandBus.execute(keepCommand(holder, 'broker-1', true, '2026-01-01T00:00:00.000Z'));
    await commandBus.execute(keepCommand(holder, 'broker-1', false, '2026-02-01T00:00:00.000Z'));

    expect(await registrations.get('broker-1')).toMatchObject({ inForce: false });
  });

  it('keeps the same registration when the same event is delivered twice', async () => {
    const { commandBus, registrations } = arrange();
    const command = keepCommand(holder, 'broker-1', true, '2026-01-01T00:00:00.000Z');

    await commandBus.execute(command);
    await commandBus.execute(command);

    expect(await registrations.get('broker-1')).toMatchObject({ inForce: true });
  });

  it('keeps the newest registration when an older event arrives late', async () => {
    const { commandBus, registrations } = arrange();

    await commandBus.execute(keepCommand(holder, 'broker-1', false, '2026-02-01T00:00:00.000Z'));
    await commandBus.execute(keepCommand(holder, 'broker-1', true, '2026-01-01T00:00:00.000Z'));

    expect(await registrations.get('broker-1')).toMatchObject({ inForce: false });
  });

  it('is refused to an actor who does not hold the permission broker-registration.keep, and keeps nothing', async () => {
    const { commandBus, registrations } = arrange();
    const command = keepCommand(anActor().build(), 'broker-1', true, '2026-01-01T00:00:00.000Z');

    await expect(commandBus.execute(command)).rejects.toMatchObject({ code: 'FORBIDDEN' });
    expect(await registrations.get('broker-1')).toBeUndefined();
  });
});

function arrange() {
  const { commandBus } = createTestBuses();
  const registrations = new FakeBrokerRegistrations();

  commandBus.use(holders).register(KeepBrokerRegistrationCommand, new KeepBrokerRegistrationHandler(registrations));

  return { commandBus, registrations };
}

function keepCommand(
  actor: Actor,
  brokerId: string,
  inForce: boolean,
  occurredAt: string,
): KeepBrokerRegistrationCommand {
  const event = brokerRegisteredV1.create(
    { brokerId },
    { id: `event-${brokerId}-${occurredAt}-${inForce}`, occurredAt },
  );

  return new KeepBrokerRegistrationCommand(
    actor,
    { brokerId, inForce, changedAt: new Date(occurredAt) },
    stampOf(event),
  );
}
