import { describe, expect, it } from '@jest/globals';
import { AuthorizationMap, RoleBasedAuthorizer, authorizationMiddleware, requires } from '@ddd-ts-kit/auth';
import { anActor } from '@ddd-ts-kit/auth/testing';
import { createTestBuses } from '@ddd-ts-kit/testing';
import { brokeragePermissions } from '@/contexts/brokerage/brokerage.permissions';
import { RegisterBrokerCommand } from '@/contexts/brokerage/application/commands/register-broker/register-broker.command';
import { RegisterBrokerHandler } from '@/contexts/brokerage/application/commands/register-broker/register-broker.handler';
import { FakeBrokerRepository } from '@/contexts/brokerage/test/fakes/broker.repository.fake';
import { FakeIntermediariesRegister } from '@/contexts/brokerage/test/fakes/intermediaries-register.fake';

const holders = authorizationMiddleware({
  authorizer: new RoleBasedAuthorizer({
    roles: { holder: [brokeragePermissions['broker.register']] },
  }),
  map: AuthorizationMap.of(requires(RegisterBrokerCommand, brokeragePermissions['broker.register'])),
});

const holder = anActor().withRole('holder').build();

describe('Register broker', () => {
  it('saves the broker with its registration number when the intermediaries register confirms it', async () => {
    const { commandBus, brokerRepository, intermediaries } = arrange();

    intermediaries.markValid('REG-0001');

    const id = await commandBus.execute(new RegisterBrokerCommand(holder, 'REG-0001'));

    expect(id).toBe('broker-1');
    expect((await brokerRepository.findById(id))?.registrationNumber).toBe('REG-0001');
  });

  it('asks the intermediaries register whether the registration is valid on the day it is brought', async () => {
    const { commandBus, intermediaries } = arrange();

    intermediaries.markValid('REG-0001');

    await commandBus.execute(new RegisterBrokerCommand(holder, 'REG-0001'));

    expect(intermediaries.asked.map((asked) => asked.registrationNumber)).toEqual(['REG-0001']);
  });

  it('refuses to register a broker whose registration is not valid, with the code INVALID_BROKER_REGISTRATION', async () => {
    const { commandBus } = arrange();
    const command = new RegisterBrokerCommand(holder, 'REG-0404');

    await expect(commandBus.execute(command)).rejects.toMatchObject({ code: 'INVALID_BROKER_REGISTRATION' });
  });

  it('saves nothing when the registration of the broker is refused', async () => {
    const { commandBus, brokerRepository } = arrange();

    await commandBus.execute(new RegisterBrokerCommand(holder, 'REG-0404')).catch(() => undefined);

    expect(await brokerRepository.findById('broker-1')).toBeUndefined();
  });

  it('is refused to an actor who does not hold the permission broker.register', async () => {
    const { commandBus } = arrange();
    const command = new RegisterBrokerCommand(anActor().build(), 'REG-0001');

    await expect(commandBus.execute(command)).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });
});

function arrange() {
  const { commandBus, clock, ids, dispatching, domainEvents } = createTestBuses({ idPrefix: 'broker' });
  // As the application hands it to the handler: the save announces the events of the broker to `domainEvents`.
  const brokerRepository = dispatching(new FakeBrokerRepository());
  const intermediaries = new FakeIntermediariesRegister();

  const handler = new RegisterBrokerHandler(brokerRepository, intermediaries, ids, clock);

  commandBus.use(holders).register(RegisterBrokerCommand, handler);

  return { commandBus, brokerRepository, intermediaries, domainEvents };
}
