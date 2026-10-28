import { describe, expect, it } from '@jest/globals';
import { executeRoute } from '@ddd-ts-kit/http';
import { nestControllerRoute } from '@ddd-ts-kit/http/nest';
import { classSchema } from '@ddd-ts-kit/validation/class-validator';
import { InMemoryCommandBus, type Actor } from '@ddd-ts-kit/kernel';
import { DecideApplicationCommand } from '@/contexts/credit-application/decision/application/commands/decide-application/decide-application.command';
import { DecideApplicationController } from '@/contexts/credit-application/decision/presentation/http/applications/decide-application/decide-application.controller';
import { creditApplicationControllers } from '@/contexts/credit-application/credit-application.controllers';

const caller: Actor = { id: 'user-1', type: 'user', roles: [], attributes: {} };
const refusal = { outcome: 'refuse', reasons: 'Too much debt for the income.', conditions: '', approvedAmountCents: 0 };

describe('POST /applications/:id/decision', () => {
  it('answers 201 when the use case succeeds', async () => {
    const commands = new InMemoryCommandBus().register(DecideApplicationCommand, {
      execute: async () => 'decide-application-1',
    });

    const response = await send(commands, refusal);

    expect(response.status).toBe(201);
    expect(creditApplicationControllers).toContain(DecideApplicationController);
  });

  it('gives the command the application of the path and the decision of the body', async () => {
    const received: DecideApplicationCommand[] = [];

    const commands = new InMemoryCommandBus().register(DecideApplicationCommand, {
      execute: async (command: DecideApplicationCommand) => {
        received.push(command);

        return command.applicationId;
      },
    });

    await send(commands, refusal);

    expect(received[0]?.applicationId).toBe('id-1');
    expect(received[0]?.decision).toMatchObject({ outcome: 'refuse', reasons: 'Too much debt for the income.' });
  });

  it('refuses an outcome that is not one of the three with 422', async () => {
    const commands = new InMemoryCommandBus().register(DecideApplicationCommand, {
      execute: async () => 'never',
    });

    const response = await send(commands, { ...refusal, outcome: 'maybe' });

    expect(response.status).toBe(422);
  });
});

async function send(commands: InMemoryCommandBus, body: object) {
  const route = nestControllerRoute(DecideApplicationController, {
    instanceOf: () => new DecideApplicationController(commands),
    schemaOfClass: (dto) => classSchema(dto, { validator: { forbidUnknownValues: false } }),
  });

  return executeRoute(
    route,
    { params: { id: 'id-1' }, query: {}, headers: {}, body, raw: undefined },
    { validateResponses: true, resolvePrincipal: () => caller },
  );
}
