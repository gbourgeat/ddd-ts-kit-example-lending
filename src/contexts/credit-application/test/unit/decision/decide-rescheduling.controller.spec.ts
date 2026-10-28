import { describe, expect, it } from '@jest/globals';
import { executeRoute } from '@ddd-ts-kit/http';
import { nestControllerRoute } from '@ddd-ts-kit/http/nest';
import { classSchema } from '@ddd-ts-kit/validation/class-validator';
import { InMemoryCommandBus, type Actor } from '@ddd-ts-kit/kernel';
import { DecideReschedulingCommand } from '@/contexts/credit-application/decision/application/commands/decide-rescheduling/decide-rescheduling.command';
import { DecideReschedulingController } from '@/contexts/credit-application/decision/presentation/http/applications/decide-rescheduling/decide-rescheduling.controller';
import { creditApplicationControllers } from '@/contexts/credit-application/credit-application.controllers';

const caller: Actor = { id: 'user-1', type: 'user', roles: [], attributes: {} };

describe('POST /applications/:id/rescheduling-decision', () => {
  it('answers 204 and sends the rescheduling of the application to the bus', async () => {
    const received: DecideReschedulingCommand[] = [];

    const commands = new InMemoryCommandBus().register(DecideReschedulingCommand, {
      execute: async (command) => {
        received.push(command);
      },
    });

    const route = nestControllerRoute(DecideReschedulingController, {
      instanceOf: () => new DecideReschedulingController(commands),
      schemaOfClass: (dto) => classSchema(dto, { validator: { forbidUnknownValues: false } }),
    });

    const response = await executeRoute(
      route,
      {
        params: { id: 'id-1' },
        query: {},
        headers: {},
        body: { durationMonths: 48, outstandingAmountCents: 1_000_000 },
        raw: undefined,
      },
      { validateResponses: true, resolvePrincipal: () => caller },
    );

    expect(response.status).toBe(204);
    expect(route.path).toBe('/applications/:id/rescheduling-decision');
    expect(creditApplicationControllers).toContain(DecideReschedulingController);

    expect({ applicationId: received[0]?.applicationId, durationMonths: received[0]?.durationMonths }).toEqual({
      applicationId: 'id-1',
      durationMonths: 48,
    });
  });

  it('refuses a body whose duration is not a whole number of months, before the use case runs', async () => {
    const commands = new InMemoryCommandBus().register(DecideReschedulingCommand, {
      execute: async () => undefined,
    });

    const route = nestControllerRoute(DecideReschedulingController, {
      instanceOf: () => new DecideReschedulingController(commands),
      schemaOfClass: (dto) => classSchema(dto, { validator: { forbidUnknownValues: false } }),
    });

    const response = await executeRoute(
      route,
      {
        params: { id: 'id-1' },
        query: {},
        headers: {},
        body: { durationMonths: 1.5, outstandingAmountCents: 1_000_000 },
        raw: undefined,
      },
      { validateResponses: true, resolvePrincipal: () => caller },
    );

    expect(response.status).toBe(422);
  });
});
