import { describe, expect, it } from '@jest/globals';
import { executeRoute } from '@ddd-ts-kit/http';
import { nestControllerRoute } from '@ddd-ts-kit/http/nest';
import { classSchema } from '@ddd-ts-kit/validation/class-validator';
import { InMemoryCommandBus, type Actor } from '@ddd-ts-kit/kernel';
import { ContestDecisionCommand } from '@/contexts/credit-application/decision/application/commands/contest-decision/contest-decision.command';
import { ContestDecisionController } from '@/contexts/credit-application/decision/presentation/http/applications/contest-decision/contest-decision.controller';
import { ContestAlreadyRecorded } from '@/contexts/credit-application/file/domain/errors/contest-already-recorded.error';
import { creditApplicationControllers } from '@/contexts/credit-application/credit-application.controllers';

const caller: Actor = { id: 'user-1', type: 'user', roles: [], attributes: {} };

describe('POST /applications/:id/contestation', () => {
  it('answers 204 when the use case succeeds', async () => {
    const commands = new InMemoryCommandBus().register(ContestDecisionCommand, { execute: async () => undefined });

    const route = nestControllerRoute(ContestDecisionController, {
      instanceOf: () => new ContestDecisionController(commands),
      schemaOfClass: (dto) => classSchema(dto),
    });

    const response = await executeRoute(
      route,
      { params: { id: 'id-1' }, query: {}, headers: {}, body: { reason: 'Wrong income.' }, raw: undefined },
      { validateResponses: true, resolvePrincipal: () => caller },
    );

    expect(response.status).toBe(204);
    expect(route.path).toBe('/applications/:id/contestation');
    expect(creditApplicationControllers).toContain(ContestDecisionController);
  });

  it('refuses a reason that is not text with 422', async () => {
    const commands = new InMemoryCommandBus().register(ContestDecisionCommand, { execute: async () => undefined });

    const route = nestControllerRoute(ContestDecisionController, {
      instanceOf: () => new ContestDecisionController(commands),
      schemaOfClass: (dto) => classSchema(dto),
    });

    const response = await executeRoute(
      route,
      { params: { id: 'id-1' }, query: {}, headers: {}, body: { reason: 12 }, raw: undefined },
      { validateResponses: true, resolvePrincipal: () => caller },
    );

    expect(response.status).toBe(422);
  });

  it('answers the refusal of the use case with its code and a client error status', async () => {
    const commands = new InMemoryCommandBus().register(ContestDecisionCommand, {
      execute: async () => {
        throw ContestAlreadyRecorded.forContestAlreadyRecorded();
      },
    });

    const route = nestControllerRoute(ContestDecisionController, {
      instanceOf: () => new ContestDecisionController(commands),
      schemaOfClass: (dto) => classSchema(dto),
    });

    const response = await executeRoute(
      route,
      { params: { id: 'id-1' }, query: {}, headers: {}, body: { reason: 'Again.' }, raw: undefined },
      { validateResponses: true, resolvePrincipal: () => caller },
    );

    expect(response.status).toBeGreaterThanOrEqual(400);
    expect(response.body).toMatchObject({ code: 'CONTEST_ALREADY_RECORDED' });
  });
});
