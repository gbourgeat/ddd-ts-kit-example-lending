import { describe, expect, it } from '@jest/globals';
import { createTestBuses } from '@ddd-ts-kit/testing';
import { stampOf, type Actor } from '@ddd-ts-kit/kernel';
import { brokerRegisteredV1, brokerRegistrationLapsedV1 } from '@/contexts/brokerage/published-language';
import { ReadBrokerRegistrationQuery } from '@/contexts/credit-application/file/application/queries/read-broker-registration/read-broker-registration.query';
import { ReadBrokerRegistrationHandler } from '@/contexts/credit-application/file/application/queries/read-broker-registration/read-broker-registration.handler';
import { FakeBrokerRegistrations } from '@/contexts/credit-application/test/fakes/broker-registrations.fake';

const reader: Actor = { id: 'decider-1', type: 'user', roles: [], attributes: {} };

describe('Read broker registration', () => {
  it('answers the registration in force, and since when, once brokerage registered the broker', async () => {
    const { queryBus, registrations } = arrange();

    const event = brokerRegisteredV1.create(
      { brokerId: 'broker-1' },
      { id: 'event-1', occurredAt: '2026-01-01T00:00:00.000Z' },
    );

    await registrations.upsertIfNewer('broker-1', stampOf(event), () => ({
      brokerId: 'broker-1',
      inForce: true,
      changedAt: new Date('2026-01-01T00:00:00.000Z'),
    }));

    expect(await queryBus.execute(new ReadBrokerRegistrationQuery(reader, 'broker-1'))).toEqual({
      brokerId: 'broker-1',
      inForce: true,
      since: '2026-01-01T00:00:00.000Z',
    });
  });

  it('answers the registration lapsed, and until when, once brokerage announced it lapsed', async () => {
    const { queryBus, registrations } = arrange();

    const event = brokerRegistrationLapsedV1.create(
      { brokerId: 'broker-1' },
      { id: 'event-2', occurredAt: '2026-02-01T00:00:00.000Z' },
    );

    await registrations.upsertIfNewer('broker-1', stampOf(event), () => ({
      brokerId: 'broker-1',
      inForce: false,
      changedAt: new Date('2026-02-01T00:00:00.000Z'),
    }));

    expect(await queryBus.execute(new ReadBrokerRegistrationQuery(reader, 'broker-1'))).toEqual({
      brokerId: 'broker-1',
      inForce: false,
      until: '2026-02-01T00:00:00.000Z',
    });
  });

  it('refuses a broker brokerage never registered, with the code UNKNOWN_BROKER_REGISTRATION', async () => {
    const { queryBus } = arrange();

    await expect(queryBus.execute(new ReadBrokerRegistrationQuery(reader, 'unknown-broker'))).rejects.toMatchObject({
      code: 'UNKNOWN_BROKER_REGISTRATION',
    });
  });
});

function arrange() {
  const { queryBus } = createTestBuses();
  const registrations = new FakeBrokerRegistrations();

  queryBus.register(ReadBrokerRegistrationQuery, new ReadBrokerRegistrationHandler(registrations));

  return { queryBus, registrations };
}
