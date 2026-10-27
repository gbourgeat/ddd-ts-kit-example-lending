import { describe, expect, it } from '@jest/globals';
import { executeRoute } from '@ddd-ts-kit/http';
import { nestControllerRoute } from '@ddd-ts-kit/http/nest';
import { classSchema } from '@ddd-ts-kit/validation/class-validator';
import { InMemoryCommandBus, type Actor } from '@ddd-ts-kit/kernel';
import { RequestPersonalDataCopyLinkCommand } from '@/contexts/data-protection/application/commands/request-personal-data-copy-link/request-personal-data-copy-link.command';
import { RequestPersonalDataCopyLinkController } from '@/contexts/data-protection/presentation/http/data-subjects/request-personal-data-copy-link/request-personal-data-copy-link.controller';
import { dataProtectionControllers } from '@/contexts/data-protection/data-protection.controllers';

const caller: Actor = { id: 'user-1', type: 'user', roles: [], attributes: {} };

describe('GET /data-subjects/:customerId/copies/:copyId/link', () => {
  it('answers 200 with the copy and a fresh link when the use case succeeds', async () => {
    const commands = new InMemoryCommandBus().register(RequestPersonalDataCopyLinkCommand, {
      execute: async () => ({
        url: 'https://files.example.test/copies/1',
        expiresAt: new Date('2026-10-27T09:00:00.000Z'),
      }),
    });

    const route = nestControllerRoute(RequestPersonalDataCopyLinkController, {
      instanceOf: () => new RequestPersonalDataCopyLinkController(commands),
      schemaOfClass: (dto) => classSchema(dto, { validator: { forbidUnknownValues: false } }),
    });

    const response = await executeRoute(
      route,
      {
        params: { customerId: 'customer-id-1', copyId: 'copy-id-1' },
        query: {},
        headers: {},
        body: {},
        raw: undefined,
      },
      { validateResponses: true, resolvePrincipal: () => caller },
    );

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ copyId: 'copy-id-1', url: 'https://files.example.test/copies/1' });
    expect(route.path).toBe('/data-subjects/:customerId/copies/:copyId/link');
    expect(dataProtectionControllers).toContain(RequestPersonalDataCopyLinkController);
  });
});
