import { InMemoryRelationTupleStore } from '@ddd-ts-kit/auth/rebac';
import { describe, expect, it } from '@jest/globals';
import { createTestBuses } from '@ddd-ts-kit/testing';
import { brokerRegisteredV1 } from '@/contexts/brokerage/published-language';
import { KeepBrokerRegistrationIntegrationHandler } from '@/contexts/credit-application/file/application/integration/handlers/keep-broker-registration.integration-handler';
import { KeepBrokerRegistrationCommand } from '@/contexts/credit-application/file/application/commands/keep-broker-registration/keep-broker-registration.command';
import { KeepBrokerRegistrationHandler } from '@/contexts/credit-application/file/application/commands/keep-broker-registration/keep-broker-registration.handler';
import { FakeBrokerRegistrations } from '@/contexts/credit-application/test/fakes/broker-registrations.fake';

describe('When brokerage publishes brokerage.broker.registered', () => {
  it('listens to the type brokerage publishes', () => {
    const { commandBus } = createTestBuses();
    const handler = new KeepBrokerRegistrationIntegrationHandler(commandBus);

    expect(handler).toBeInstanceOf(KeepBrokerRegistrationIntegrationHandler);
    expect(KeepBrokerRegistrationIntegrationHandler.eventType).toBe('brokerage.broker.registered');
  });

  it('acts as a system actor named after its consumer name', () => {
    const { commandBus } = createTestBuses();
    const handler = new KeepBrokerRegistrationIntegrationHandler(commandBus);

    expect(handler.actor).toMatchObject({ id: 'system:credit-application.keep-broker-registration', type: 'system' });
  });

  it('keeps the broker registration in force, and has the same outcome when delivered twice', async () => {
    const { commandBus } = createTestBuses();
    const registrations = new FakeBrokerRegistrations();

    commandBus.register(
      KeepBrokerRegistrationCommand,
      new KeepBrokerRegistrationHandler(registrations, new InMemoryRelationTupleStore()),
    );

    const handler = new KeepBrokerRegistrationIntegrationHandler(commandBus);

    const event = brokerRegisteredV1.create(
      { brokerId: 'broker-1' },
      { id: 'event-1', occurredAt: '2026-01-01T00:00:00.000Z' },
    );

    await handler.handle(event);
    await handler.handle(event);

    expect(await registrations.get('broker-1')).toMatchObject({ brokerId: 'broker-1', inForce: true });
  });
});
