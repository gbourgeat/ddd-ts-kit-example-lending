import { describe, expect, it } from '@jest/globals';
import { executeRoute } from '@ddd-ts-kit/http';
import { nestControllerRoute } from '@ddd-ts-kit/http/nest';
import { classSchema } from '@ddd-ts-kit/validation/class-validator';
import { InMemoryCommandBus, type Actor } from '@ddd-ts-kit/kernel';
import { RequestExceptionCommand } from '@/contexts/credit-application/decision/application/commands/request-exception/request-exception.command';
import { RequestExceptionController } from '@/contexts/credit-application/decision/presentation/http/applications/request-exception/request-exception.controller';
import { creditApplicationControllers } from '@/contexts/credit-application/credit-application.controllers';

const caller: Actor = { id: 'user-1', type: 'user', roles: [], attributes: {} };

describe('POST /applications/:id/exceptions', () => {
  it('answers 204 when the use case succeeds', async () => {
    const commands = new InMemoryCommandBus().register(RequestExceptionCommand, {
      execute: async () => undefined,
    });

    const route = nestControllerRoute(RequestExceptionController, {
      instanceOf: () => new RequestExceptionController(commands),
      // A DTO without a decorated field yet accepts the empty object alone: whitelist and forbidNonWhitelisted refuse any field.
      schemaOfClass: (dto) => classSchema(dto, { validator: { forbidUnknownValues: false } }),
    });

    const response = await executeRoute(
      route,
      { params: { id: 'id-1' }, query: {}, headers: {}, body: {}, raw: undefined },
      { validateResponses: true, resolvePrincipal: () => caller },
    );

    expect(response.status).toBe(204);
    expect(route.path).toBe('/applications/:id/exceptions');
    expect(creditApplicationControllers).toContain(RequestExceptionController);
  });

  // TODO(domain): replace each entry below by a test of the contract a client relies on.
  it.todo('refuses an input that does not have the expected shape with 422');
  it.todo('answers the documented status for each error code of the use case');
});
