import { describe, expect, it } from '@jest/globals';
import { executeRoute } from '@ddd-ts-kit/http';
import { nestControllerRoute } from '@ddd-ts-kit/http/nest';
import { classSchema } from '@ddd-ts-kit/validation/class-validator';
import { InMemoryCommandBus, type Actor } from '@ddd-ts-kit/kernel';
import { DecideExceptionCommand } from '@/contexts/credit-application/decision/application/commands/decide-exception/decide-exception.command';
import { DecideExceptionController } from '@/contexts/credit-application/decision/presentation/http/applications/decide-exception/decide-exception.controller';
import { NotCreditCommittee } from '@/contexts/credit-application/decision/domain/errors/not-credit-committee.error';
import { creditApplicationControllers } from '@/contexts/credit-application/credit-application.controllers';

const caller: Actor = { id: 'user-1', type: 'user', roles: [], attributes: {} };

describe('POST /applications/:id/exception-decision', () => {
  it('answers 204 when the use case succeeds', async () => {
    const commands = new InMemoryCommandBus().register(DecideExceptionCommand, { execute: async () => undefined });

    const route = nestControllerRoute(DecideExceptionController, {
      instanceOf: () => new DecideExceptionController(commands),
      schemaOfClass: (dto) => classSchema(dto),
    });

    const response = await executeRoute(
      route,
      {
        params: { id: 'id-1' },
        query: {},
        headers: {},
        body: { outcome: 'approve', reasons: 'Sound.' },
        raw: undefined,
      },
      { validateResponses: true, resolvePrincipal: () => caller },
    );

    expect(response.status).toBe(204);
    expect(route.path).toBe('/applications/:id/exception-decision');
    expect(creditApplicationControllers).toContain(DecideExceptionController);
  });

  it('refuses an outcome other than approve or refuse with 422', async () => {
    const commands = new InMemoryCommandBus().register(DecideExceptionCommand, { execute: async () => undefined });

    const route = nestControllerRoute(DecideExceptionController, {
      instanceOf: () => new DecideExceptionController(commands),
      schemaOfClass: (dto) => classSchema(dto),
    });

    const response = await executeRoute(
      route,
      {
        params: { id: 'id-1' },
        query: {},
        headers: {},
        body: { outcome: 'approve-with-conditions', reasons: 'x' },
        raw: undefined,
      },
      { validateResponses: true, resolvePrincipal: () => caller },
    );

    expect(response.status).toBe(422);
  });

  it('answers the refusal of the use case with its code and a client error status', async () => {
    const commands = new InMemoryCommandBus().register(DecideExceptionCommand, {
      execute: async () => {
        throw NotCreditCommittee.forNotCreditCommittee('advisor');
      },
    });

    const route = nestControllerRoute(DecideExceptionController, {
      instanceOf: () => new DecideExceptionController(commands),
      schemaOfClass: (dto) => classSchema(dto),
    });

    const response = await executeRoute(
      route,
      { params: { id: 'id-1' }, query: {}, headers: {}, body: { outcome: 'refuse', reasons: 'No.' }, raw: undefined },
      { validateResponses: true, resolvePrincipal: () => caller },
    );

    expect(response.status).toBeGreaterThanOrEqual(400);
    expect(response.body).toMatchObject({ code: 'NOT_CREDIT_COMMITTEE' });
  });
});
