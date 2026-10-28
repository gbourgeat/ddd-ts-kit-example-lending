import { describe, expect, it } from '@jest/globals';
import { executeRoute } from '@ddd-ts-kit/http';
import { nestControllerRoute } from '@ddd-ts-kit/http/nest';
import { classSchema } from '@ddd-ts-kit/validation/class-validator';
import { InMemoryCommandBus, type Actor } from '@ddd-ts-kit/kernel';
import { BringApplicationCommand } from '@/contexts/credit-application/file/application/commands/bring-application/bring-application.command';
import { BringApplicationController } from '@/contexts/credit-application/file/presentation/http/applications/bring-application/bring-application.controller';
import { BrokerRegistrationLapsed } from '@/contexts/credit-application/file/domain/errors/broker-registration-lapsed.error';
import { creditApplicationControllers } from '@/contexts/credit-application/credit-application.controllers';

const broker: Actor = { id: 'broker-1', type: 'user', roles: [], attributes: {} };

const body = {
  customerId: 'customer-1',
  productId: 'personal-loan',
  amount: { cents: 1234567, currency: 'EUR' },
  durationMonths: 60,
};

describe('POST /applications/bring', () => {
  it('answers 201 with the identifier of the application the broker brought', async () => {
    const commands = new InMemoryCommandBus().register(BringApplicationCommand, {
      execute: async () => 'bring-application-1',
    });

    const response = await bring(commands, body);

    expect(response.status).toBe(201);
    expect(response.body).toEqual({ id: 'bring-application-1' });
    expect(creditApplicationControllers).toContain(BringApplicationController);
  });

  it('refuses a body that carries no amount, before the use case runs, with 422', async () => {
    const commands = new InMemoryCommandBus().register(BringApplicationCommand, {
      execute: async () => 'bring-application-1',
    });

    const response = await bring(commands, {
      customerId: 'customer-1',
      productId: 'personal-loan',
      durationMonths: 60,
    });

    expect(response.status).toBe(422);
  });

  it('answers the refusal code of a broker whose registration lapsed', async () => {
    const commands = new InMemoryCommandBus().register(BringApplicationCommand, {
      execute: async () => {
        throw BrokerRegistrationLapsed.forBroker('broker-1');
      },
    });

    const response = await bring(commands, body);

    expect(response.body).toMatchObject({ code: 'BROKER_REGISTRATION_LAPSED' });
  });
});

/** The route of the controller, called with the body given and the broker as the caller. */
function bring(commands: InMemoryCommandBus, requestBody: unknown) {
  const route = nestControllerRoute(BringApplicationController, {
    instanceOf: () => new BringApplicationController(commands),
    schemaOfClass: (dto) => classSchema(dto),
  });

  return executeRoute(
    route,
    { params: {}, query: {}, headers: {}, body: requestBody, raw: undefined },
    { validateResponses: true, resolvePrincipal: () => broker },
  );
}
