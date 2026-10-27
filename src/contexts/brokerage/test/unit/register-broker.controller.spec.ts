import { describe, expect, it } from '@jest/globals';
import { executeRoute } from '@ddd-ts-kit/http';
import { nestControllerRoute } from '@ddd-ts-kit/http/nest';
import { classSchema } from '@ddd-ts-kit/validation/class-validator';
import { InMemoryCommandBus, type Actor } from '@ddd-ts-kit/kernel';
import { RegisterBrokerCommand } from '@/contexts/brokerage/application/commands/register-broker/register-broker.command';
import { RegisterBrokerController } from '@/contexts/brokerage/presentation/http/brokers/register-broker/register-broker.controller';
import { InvalidBrokerRegistration } from '@/contexts/brokerage/domain/errors/invalid-broker-registration.error';
import { brokerageControllers } from '@/contexts/brokerage/brokerage.controllers';

const caller: Actor = { id: 'user-1', type: 'user', roles: [], attributes: {} };

describe('POST /brokers', () => {
  it('answers 201 with the identifier of the broker when the use case succeeds', async () => {
    const commands = new InMemoryCommandBus().register(RegisterBrokerCommand, {
      execute: async () => 'broker-1',
    });

    const route = routeWith(commands);

    const response = await executeRoute(
      route,
      { params: {}, query: {}, headers: {}, body: { registrationNumber: 'REG-0001' }, raw: undefined },
      { validateResponses: true, resolvePrincipal: () => caller },
    );

    expect(response.status).toBe(201);
    expect(route.path).toBe('/brokers');
    expect(brokerageControllers).toContain(RegisterBrokerController);
  });

  it('refuses an input without a registration number with 422', async () => {
    const commands = new InMemoryCommandBus().register(RegisterBrokerCommand, {
      execute: async () => 'broker-1',
    });

    const route = routeWith(commands);

    const response = await executeRoute(
      route,
      { params: {}, query: {}, headers: {}, body: { registrationNumber: 42 }, raw: undefined },
      { validateResponses: true, resolvePrincipal: () => caller },
    );

    expect(response.status).toBe(422);
  });

  it('answers the documented status for the refusal of an invalid registration', async () => {
    const commands = new InMemoryCommandBus().register(RegisterBrokerCommand, {
      execute: async () => {
        throw InvalidBrokerRegistration.forRegistration('REG-0404');
      },
    });

    const route = routeWith(commands);

    const response = await executeRoute(
      route,
      { params: {}, query: {}, headers: {}, body: { registrationNumber: 'REG-0404' }, raw: undefined },
      { validateResponses: true, resolvePrincipal: () => caller },
    );

    expect(response.status).toBe(422);
    expect(response.body).toMatchObject({ code: 'INVALID_BROKER_REGISTRATION' });
  });
});

function routeWith(commands: InMemoryCommandBus) {
  return nestControllerRoute(RegisterBrokerController, {
    instanceOf: () => new RegisterBrokerController(commands),
    schemaOfClass: (dto) => classSchema(dto),
  });
}
