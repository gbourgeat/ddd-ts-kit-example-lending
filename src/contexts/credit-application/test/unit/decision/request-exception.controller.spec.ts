import { describe, expect, it } from '@jest/globals';
import { executeRoute } from '@ddd-ts-kit/http';
import { nestControllerRoute } from '@ddd-ts-kit/http/nest';
import { classSchema } from '@ddd-ts-kit/validation/class-validator';
import { InMemoryCommandBus, type Actor } from '@ddd-ts-kit/kernel';
import { RequestExceptionCommand } from '@/contexts/credit-application/decision/application/commands/request-exception/request-exception.command';
import { RequestExceptionController } from '@/contexts/credit-application/decision/presentation/http/applications/request-exception/request-exception.controller';
import { ExceptionNotAboveLimit } from '@/contexts/credit-application/decision/domain/errors/exception-not-above-limit.error';
import { creditApplicationControllers } from '@/contexts/credit-application/credit-application.controllers';

const caller: Actor = { id: 'user-1', type: 'user', roles: [], attributes: {} };

describe('POST /applications/:id/exceptions', () => {
  it('answers 204 when the use case succeeds', async () => {
    const commands = new InMemoryCommandBus().register(RequestExceptionCommand, {
      execute: async () => undefined,
    });

    const route = nestControllerRoute(RequestExceptionController, {
      instanceOf: () => new RequestExceptionController(commands),
      schemaOfClass: (dto) => classSchema(dto),
    });

    const response = await executeRoute(
      route,
      { params: { id: 'id-1' }, query: {}, headers: {}, body: { justification: 'A reason.' }, raw: undefined },
      { validateResponses: true, resolvePrincipal: () => caller },
    );

    expect(response.status).toBe(204);
    expect(route.path).toBe('/applications/:id/exceptions');
    expect(creditApplicationControllers).toContain(RequestExceptionController);
  });

  it('refuses a justification that is not text with 422', async () => {
    const commands = new InMemoryCommandBus().register(RequestExceptionCommand, {
      execute: async () => undefined,
    });

    const route = nestControllerRoute(RequestExceptionController, {
      instanceOf: () => new RequestExceptionController(commands),
      schemaOfClass: (dto) => classSchema(dto),
    });

    const response = await executeRoute(
      route,
      { params: { id: 'id-1' }, query: {}, headers: {}, body: { justification: 12 }, raw: undefined },
      { validateResponses: true, resolvePrincipal: () => caller },
    );

    expect(response.status).toBe(422);
  });

  it('answers the refusal of the use case with its code and a client error status', async () => {
    const commands = new InMemoryCommandBus().register(RequestExceptionCommand, {
      execute: async () => {
        throw ExceptionNotAboveLimit.forExceptionNotAboveLimit('advisor');
      },
    });

    const route = nestControllerRoute(RequestExceptionController, {
      instanceOf: () => new RequestExceptionController(commands),
      schemaOfClass: (dto) => classSchema(dto),
    });

    const response = await executeRoute(
      route,
      {
        params: { id: 'id-1' },
        query: {},
        headers: {},
        body: { justification: 'A reason.' },
        raw: undefined,
      },
      { validateResponses: true, resolvePrincipal: () => caller },
    );

    expect(response.status).toBeGreaterThanOrEqual(400);
    expect(response.body).toMatchObject({ code: 'EXCEPTION_NOT_ABOVE_LIMIT' });
  });
});
