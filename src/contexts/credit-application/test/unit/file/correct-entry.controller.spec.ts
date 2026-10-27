import { describe, expect, it } from '@jest/globals';
import { executeRoute } from '@ddd-ts-kit/http';
import { nestControllerRoute } from '@ddd-ts-kit/http/nest';
import { classSchema } from '@ddd-ts-kit/validation/class-validator';
import { InMemoryCommandBus, type Actor } from '@ddd-ts-kit/kernel';
import { CorrectEntryCommand } from '@/contexts/credit-application/file/application/commands/correct-entry/correct-entry.command';
import { CorrectEntryController } from '@/contexts/credit-application/file/presentation/http/applications/correct-entry/correct-entry.controller';
import { creditApplicationControllers } from '@/contexts/credit-application/credit-application.controllers';

const caller: Actor = { id: 'user-1', type: 'user', roles: [], attributes: {} };

describe('POST /applications/:id/corrections', () => {
  it('answers 201 when the use case succeeds', async () => {
    const commands = new InMemoryCommandBus().register(CorrectEntryCommand, {
      execute: async (command: CorrectEntryCommand) => command.applicationId,
    });

    const route = nestControllerRoute(CorrectEntryController, {
      instanceOf: () => new CorrectEntryController(commands),
      schemaOfClass: (dto) => classSchema(dto, { validator: { forbidUnknownValues: false } }),
    });

    const response = await executeRoute(
      route,
      {
        params: { id: 'id-1' },
        query: {},
        headers: {},
        body: { entryId: 'id-1#2', reason: 'Named by mistake' },
        raw: undefined,
      },
      { validateResponses: true, resolvePrincipal: () => caller },
    );

    expect(response.status).toBe(201);
    expect(route.path).toBe('/applications/:id/corrections');
    expect(creditApplicationControllers).toContain(CorrectEntryController);
  });

  it('sends the entry and the reason the body gives, on the application the path names', async () => {
    const sent: CorrectEntryCommand[] = [];

    const commands = new InMemoryCommandBus().register(CorrectEntryCommand, {
      execute: async (command: CorrectEntryCommand) => {
        sent.push(command);

        return command.applicationId;
      },
    });

    const route = nestControllerRoute(CorrectEntryController, {
      instanceOf: () => new CorrectEntryController(commands),
      schemaOfClass: (dto) => classSchema(dto, { validator: { forbidUnknownValues: false } }),
    });

    await executeRoute(
      route,
      {
        params: { id: 'id-1' },
        query: {},
        headers: {},
        body: { entryId: 'id-1#2', reason: 'Named by mistake' },
        raw: undefined,
      },
      { validateResponses: true, resolvePrincipal: () => caller },
    );

    expect(sent[0]).toMatchObject({ applicationId: 'id-1', entryId: 'id-1#2', reason: 'Named by mistake' });
  });
});
