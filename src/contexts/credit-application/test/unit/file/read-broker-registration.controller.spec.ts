import { describe, expect, it } from '@jest/globals';
import { executeRoute } from '@ddd-ts-kit/http';
import { nestControllerRoute } from '@ddd-ts-kit/http/nest';
import { classSchema } from '@ddd-ts-kit/validation/class-validator';
import { InMemoryQueryBus, type Actor } from '@ddd-ts-kit/kernel';
import { ReadBrokerRegistrationQuery } from '@/contexts/credit-application/file/application/queries/read-broker-registration/read-broker-registration.query';
import { ReadBrokerRegistrationController } from '@/contexts/credit-application/file/presentation/http/brokers/read-broker-registration/read-broker-registration.controller';
import { creditApplicationControllers } from '@/contexts/credit-application/credit-application.controllers';

const caller: Actor = { id: 'user-1', type: 'user', roles: [], attributes: {} };

describe('GET /brokers/:brokerId/registration', () => {
  it('answers 200 with the registration of the broker, in force since its registration', async () => {
    const queries = new InMemoryQueryBus().register(ReadBrokerRegistrationQuery, {
      execute: async () => ({ brokerId: 'broker-1', inForce: true, since: '2026-01-01T00:00:00.000Z' }),
    });

    const route = nestControllerRoute(ReadBrokerRegistrationController, {
      instanceOf: () => new ReadBrokerRegistrationController(queries),
      schemaOfClass: (dto) => classSchema(dto),
    });

    const response = await executeRoute(
      route,
      { params: { brokerId: 'broker-1' }, query: {}, headers: {}, body: {}, raw: undefined },
      { validateResponses: true, resolvePrincipal: () => caller },
    );

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ brokerId: 'broker-1', inForce: true, since: '2026-01-01T00:00:00.000Z' });
    expect(route.path).toBe('/brokers/:brokerId/registration');
    expect(creditApplicationControllers).toContain(ReadBrokerRegistrationController);
  });
});
