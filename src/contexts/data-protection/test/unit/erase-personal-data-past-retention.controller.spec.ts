import { describe, expect, it } from '@jest/globals';
import { executeRoute } from '@ddd-ts-kit/http';
import { nestControllerRoute } from '@ddd-ts-kit/http/nest';
import { classSchema } from '@ddd-ts-kit/validation/class-validator';
import { InMemoryCommandBus, type Actor } from '@ddd-ts-kit/kernel';
import { ErasePersonalDataPastRetentionCommand } from '@/contexts/data-protection/application/commands/erase-personal-data-past-retention/erase-personal-data-past-retention.command';
import { ErasePersonalDataPastRetentionController } from '@/contexts/data-protection/presentation/http/personal-data/erase-personal-data-past-retention/erase-personal-data-past-retention.controller';
import { dataProtectionControllers } from '@/contexts/data-protection/data-protection.controllers';

const caller: Actor = { id: 'user-1', type: 'user', roles: [], attributes: {} };

describe('POST /personal-data/erasures', () => {
  it('answers 204 when the use case succeeds', async () => {
    const commands = new InMemoryCommandBus().register(ErasePersonalDataPastRetentionCommand, {
      execute: async () => undefined,
    });

    const route = nestControllerRoute(ErasePersonalDataPastRetentionController, {
      instanceOf: () => new ErasePersonalDataPastRetentionController(commands),
      // A DTO without a decorated field yet accepts the empty object alone: whitelist and forbidNonWhitelisted refuse any field.
      schemaOfClass: (dto) => classSchema(dto, { validator: { forbidUnknownValues: false } }),
    });

    const response = await executeRoute(
      route,
      { params: {}, query: {}, headers: {}, body: {}, raw: undefined },
      { validateResponses: true, resolvePrincipal: () => caller },
    );

    expect(response.status).toBe(204);
    expect(route.path).toBe('/personal-data/erasures');
    expect(dataProtectionControllers).toContain(ErasePersonalDataPastRetentionController);
  });

  it('runs the command as the caller of the request, with no input of its own', async () => {
    const received: unknown[] = [];

    const commands = new InMemoryCommandBus().register(ErasePersonalDataPastRetentionCommand, {
      execute: async (command: unknown) => {
        received.push(command);
      },
    });

    const route = nestControllerRoute(ErasePersonalDataPastRetentionController, {
      instanceOf: () => new ErasePersonalDataPastRetentionController(commands),
      schemaOfClass: (dto) => classSchema(dto, { validator: { forbidUnknownValues: false } }),
    });

    await executeRoute(
      route,
      { params: {}, query: {}, headers: {}, body: {}, raw: undefined },
      { validateResponses: true, resolvePrincipal: () => caller },
    );

    expect(received).toHaveLength(1);
    expect(received[0]).toBeInstanceOf(ErasePersonalDataPastRetentionCommand);
  });
});
