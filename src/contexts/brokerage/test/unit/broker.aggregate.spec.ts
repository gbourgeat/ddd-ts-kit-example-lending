import { describe, expect, it } from '@jest/globals';
import { BrokerRegistered } from '@/contexts/brokerage/domain/events/broker-registered.event';
import { BrokerRegistrationLapsed } from '@/contexts/brokerage/domain/events/broker-registration-lapsed.event';
import { Broker } from '@/contexts/brokerage/domain/aggregates/broker.aggregate';
import { aBroker } from '@/contexts/brokerage/test/builders/broker.builder';

describe('Broker', () => {
  it('is born with its identity and what it holds', () => {
    const bornAt = new Date('2026-03-01T00:00:00.000Z');

    const born = aBroker().identifiedBy('broker-7').bornAt(bornAt).build();

    expect(born.id).toBe('broker-7');
    expect(born.registeredAt).toEqual(bornAt);
  });

  it('records the fact that it is registered', () => {
    const bornAt = new Date('2026-03-01T00:00:00.000Z');

    const recorded = aBroker().identifiedBy('broker-7').bornAt(bornAt).build();

    expect(recorded.pullEvents()).toEqual([new BrokerRegistered('broker-7', bornAt)]);
  });

  it('is rehydrated in its stored state without recording a new fact', () => {
    const stored = aBroker().build();

    const loaded = Broker.rehydrate(stored.id, stored.toState());

    expect(loaded.toState()).toEqual(stored.toState());
    expect(loaded.pullEvents()).toEqual([]);
  });
});

describe('Broker, registration lapsed', () => {
  it('is marked lapsed on the day its registration is found no longer valid, recording that fact', () => {
    const stored = aBroker().identifiedBy('broker-7').build();
    const loaded = Broker.rehydrate(stored.id, stored.toState());
    const day = new Date('2026-10-27T06:00:00.000Z');

    loaded.markLapsed(day);

    expect(loaded.lapsedOn).toEqual(day);
    expect(loaded.pullEvents()).toEqual([new BrokerRegistrationLapsed('broker-7', day)]);
  });

  it('is not marked again once lapsed: the first day stays and no second fact is recorded', () => {
    const loaded = Broker.rehydrate('broker-7', {
      registeredAt: new Date('2026-03-01T00:00:00.000Z'),
      registrationNumber: 'REG-0001',
      lapsedOn: new Date('2026-10-26T06:00:00.000Z'),
    });

    loaded.markLapsed(new Date('2026-10-27T06:00:00.000Z'));

    expect(loaded.lapsedOn).toEqual(new Date('2026-10-26T06:00:00.000Z'));
    expect(loaded.pullEvents()).toEqual([]);
  });

  it('is registered and not lapsed until it is marked', () => {
    const built = aBroker().build();

    expect(built.lapsedOn).toBeUndefined();
  });
});

describe('aBroker exposes what it holds', () => {
  it('gives back each fact the aggregate was born with', () => {
    const built = aBroker().build();

    expect(built.registrationNumber).toEqual('REG-0001');
  });
});
