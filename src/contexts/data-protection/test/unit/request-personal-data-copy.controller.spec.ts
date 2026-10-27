import { describe, expect, it } from '@jest/globals';
import { executeRoute } from '@ddd-ts-kit/http';
import { nestControllerRoute } from '@ddd-ts-kit/http/nest';
import { classSchema } from '@ddd-ts-kit/validation/class-validator';
import { InMemoryCommandBus, type Actor } from '@ddd-ts-kit/kernel';
import { RequestPersonalDataCopyCommand } from '@/contexts/data-protection/application/commands/request-personal-data-copy/request-personal-data-copy.command';
import { RequestPersonalDataCopyController } from '@/contexts/data-protection/presentation/http/data-subjects/request-personal-data-copy/request-personal-data-copy.controller';
import { dataProtectionControllers } from '@/contexts/data-protection/data-protection.controllers';

const caller: Actor = { id: 'user-1', type: 'user', roles: [], attributes: {} };

describe('POST /data-subjects/:customerId/copies', () => {
  it('answers 201 with the copy and the signed link to it when the use case succeeds', async () => {
    const commands = new InMemoryCommandBus().register(RequestPersonalDataCopyCommand, {
      execute: async () => ({
        copyId: 'copy-1',
        link: { url: 'https://files.example.test/copies/1', expiresAt: new Date('2026-10-27T09:00:00.000Z') },
      }),
    });

    const route = nestControllerRoute(RequestPersonalDataCopyController, {
      instanceOf: () => new RequestPersonalDataCopyController(commands),
      schemaOfClass: (dto) => classSchema(dto, { validator: { forbidUnknownValues: false } }),
    });

    const response = await executeRoute(
      route,
      { params: { customerId: 'customer-1' }, query: {}, headers: {}, body: {}, raw: undefined },
      { validateResponses: true, resolvePrincipal: () => caller },
    );

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({ copyId: 'copy-1', url: 'https://files.example.test/copies/1' });
    expect(route.path).toBe('/data-subjects/:customerId/copies');
    expect(dataProtectionControllers).toContain(RequestPersonalDataCopyController);
  });
});
