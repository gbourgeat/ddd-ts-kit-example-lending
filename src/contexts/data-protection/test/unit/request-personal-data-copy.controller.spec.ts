import { describe, expect, it } from '@jest/globals';
import { executeRoute } from '@ddd-ts-kit/http';
import { nestControllerRoute } from '@ddd-ts-kit/http/nest';
import { classSchema } from '@ddd-ts-kit/validation/class-validator';
import { InMemoryCommandBus, type Actor } from '@ddd-ts-kit/kernel';
import { RequestPersonalDataCopyCommand } from '@/contexts/data-protection/application/commands/request-personal-data-copy/request-personal-data-copy.command';
import { RequestPersonalDataCopyController } from '@/contexts/data-protection/presentation/http/data-subjects/request-personal-data-copy/request-personal-data-copy.controller';
import { dataProtectionControllers } from '@/contexts/data-protection/data-protection.controllers';

const caller: Actor = { id: 'user-1', type: 'user', roles: [], attributes: {} };

describe('POST /data-subjects/me/copies', () => {
  it('answers 204 when the use case succeeds', async () => {
    const commands = new InMemoryCommandBus().register(RequestPersonalDataCopyCommand, {
      execute: async () => undefined,
    });

    const route = nestControllerRoute(RequestPersonalDataCopyController, {
      instanceOf: () => new RequestPersonalDataCopyController(commands),
      // A DTO without a decorated field yet accepts the empty object alone: whitelist and forbidNonWhitelisted refuse any field.
      schemaOfClass: (dto) => classSchema(dto, { validator: { forbidUnknownValues: false } }),
    });

    const response = await executeRoute(
      route,
      { params: {}, query: {}, headers: {}, body: {}, raw: undefined },
      { validateResponses: true, resolvePrincipal: () => caller },
    );

    expect(response.status).toBe(204);
    expect(route.path).toBe('/data-subjects/me/copies');
    expect(dataProtectionControllers).toContain(RequestPersonalDataCopyController);
  });

  // TODO(domain): replace each entry below by a test of the contract a client relies on.
  it.todo('refuses an input that does not have the expected shape with 422');
  it.todo('answers the documented status for each error code of the use case');
});
