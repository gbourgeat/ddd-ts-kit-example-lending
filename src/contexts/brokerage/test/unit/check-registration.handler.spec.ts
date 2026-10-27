import { describe, expect, it } from '@jest/globals';
import { AuthorizationMap, RoleBasedAuthorizer, authorizationMiddleware, requires } from '@ddd-ts-kit/auth';
import { anActor } from '@ddd-ts-kit/auth/testing';
import { createTestBuses } from '@ddd-ts-kit/testing';
import { brokeragePermissions } from '@/contexts/brokerage/brokerage.permissions';
import { CheckRegistrationCommand } from '@/contexts/brokerage/application/commands/check-registration/check-registration.command';
import { CheckRegistrationHandler } from '@/contexts/brokerage/application/commands/check-registration/check-registration.handler';
import { FakeBrokerRepository } from '@/contexts/brokerage/test/fakes/broker.repository.fake';
import { FakeIntermediariesRegister } from '@/contexts/brokerage/test/fakes/intermediaries-register.fake';
import { aBroker } from '@/contexts/brokerage/test/builders/broker.builder';

const holders = authorizationMiddleware({
  authorizer: new RoleBasedAuthorizer({
    roles: { holder: [brokeragePermissions['broker.check']] },
  }),
  map: AuthorizationMap.of(requires(CheckRegistrationCommand, brokeragePermissions['broker.check'])),
});

const holder = anActor().withRole('holder').build();

describe('Check registrations', () => {
  it('marks as lapsed the broker whose registration is no longer valid on the day of the check', async () => {
    const { commandBus, brokerRepository, clock } = arrange();

    await brokerRepository.save(aBroker().identifiedBy('broker-1').numbered('REG-0001').build());
    await commandBus.execute(new CheckRegistrationCommand(holder));

    expect((await brokerRepository.findById('broker-1'))?.lapsedOn).toEqual(clock.now());
  });

  it('leaves unmarked the broker whose registration is still valid on the day of the check', async () => {
    const { commandBus, brokerRepository, intermediaries } = arrange();

    intermediaries.markValid('REG-0002');
    await brokerRepository.save(aBroker().identifiedBy('broker-2').numbered('REG-0002').build());
    await commandBus.execute(new CheckRegistrationCommand(holder));

    expect((await brokerRepository.findById('broker-2'))?.lapsedOn).toBeUndefined();
  });

  it('answers how many brokers it marked as lapsed', async () => {
    const { commandBus, brokerRepository, intermediaries } = arrange();

    intermediaries.markValid('REG-0002');
    await brokerRepository.save(aBroker().identifiedBy('broker-1').numbered('REG-0001').build());
    await brokerRepository.save(aBroker().identifiedBy('broker-2').numbered('REG-0002').build());
    await brokerRepository.save(aBroker().identifiedBy('broker-3').numbered('REG-0003').build());

    expect(await commandBus.execute(new CheckRegistrationCommand(holder))).toBe(2);
  });

  it('announces the lapse of each broker it marks, as its save is made', async () => {
    const { commandBus, brokerRepository, domainEvents } = arrange();
    const announced: string[] = [];

    domainEvents.on('brokerage.broker.registration-lapsed', async (event) => {
      announced.push(event.aggregateId);
    });

    await brokerRepository.save(aBroker().identifiedBy('broker-1').numbered('REG-0001').build());
    await commandBus.execute(new CheckRegistrationCommand(holder));

    expect(announced).toEqual(['broker-1']);
  });

  it('does not mark again a broker already lapsed, so the lapse is announced once', async () => {
    const { commandBus, brokerRepository, domainEvents } = arrange();
    const announced: string[] = [];

    domainEvents.on('brokerage.broker.registration-lapsed', async (event) => {
      announced.push(event.aggregateId);
    });

    await brokerRepository.save(aBroker().identifiedBy('broker-1').numbered('REG-0001').build());
    await commandBus.execute(new CheckRegistrationCommand(holder));
    const secondRun = await commandBus.execute(new CheckRegistrationCommand(holder));

    expect(secondRun).toBe(0);
    expect(announced).toEqual(['broker-1']);
  });

  it('saves nothing for a broker whose registration is still valid', async () => {
    const { commandBus, brokerRepository, intermediaries, domainEvents } = arrange();
    const announced: string[] = [];

    intermediaries.markValid('REG-0002');

    domainEvents.on('brokerage.broker.registration-lapsed', async (event) => {
      announced.push(event.aggregateId);
    });

    await brokerRepository.save(aBroker().identifiedBy('broker-2').numbered('REG-0002').build());
    await commandBus.execute(new CheckRegistrationCommand(holder));

    expect(announced).toEqual([]);
  });

  it('is refused to an actor who does not hold the permission broker.check', async () => {
    const { commandBus } = arrange();
    const command = new CheckRegistrationCommand(anActor().build());

    await expect(commandBus.execute(command)).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });
});

function arrange() {
  const { commandBus, clock, ids, dispatching, domainEvents } = createTestBuses({ idPrefix: 'broker' });
  // As the application hands it to the handler: the save announces the events of the broker to `domainEvents`.
  const brokerRepository = dispatching(new FakeBrokerRepository());
  const intermediaries = new FakeIntermediariesRegister();

  const handler = new CheckRegistrationHandler(brokerRepository, intermediaries, clock);

  commandBus.use(holders).register(CheckRegistrationCommand, handler);

  return { commandBus, brokerRepository, intermediaries, domainEvents, clock, ids };
}
