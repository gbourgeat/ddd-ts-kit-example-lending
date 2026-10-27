import { describe, expect, it } from '@jest/globals';
import { executeRoute } from '@ddd-ts-kit/http';
import { nestControllerRoute } from '@ddd-ts-kit/http/nest';
import { classSchema } from '@ddd-ts-kit/validation/class-validator';
import { InMemoryCommandBus, type Actor } from '@ddd-ts-kit/kernel';
import { GiveAccountConsentCommand } from '@/contexts/credit-application/file/application/commands/give-account-consent/give-account-consent.command';
import { GiveAccountConsentController } from '@/contexts/credit-application/file/presentation/http/applications/give-account-consent/give-account-consent.controller';
import { creditApplicationControllers } from '@/contexts/credit-application/credit-application.controllers';

const caller: Actor = { id: 'user-1', type: 'user', roles: [], attributes: {} };

describe('POST /applications/:id/consent', () => {
  it('answers 201 when the use case succeeds', async () => {
    const commands = new InMemoryCommandBus().register(GiveAccountConsentCommand, {
      execute: async () => 'give-account-consent-1',
    });

    const route = nestControllerRoute(GiveAccountConsentController, {
      instanceOf: () => new GiveAccountConsentController(commands),
      // A DTO without a decorated field yet accepts the empty object alone: whitelist and forbidNonWhitelisted refuse any field.
      schemaOfClass: (dto) => classSchema(dto, { validator: { forbidUnknownValues: false } }),
    });

    const response = await executeRoute(
      route,
      { params: { id: 'id-1' }, query: {}, headers: {}, body: {}, raw: undefined },
      { validateResponses: true, resolvePrincipal: () => caller },
    );

    expect(response.status).toBe(201);
    expect(route.path).toBe('/applications/:id/consent');
    expect(creditApplicationControllers).toContain(GiveAccountConsentController);
  });

  // TODO(domain): replace each entry below by a test of the contract a client relies on.
  it.todo('refuses an input that does not have the expected shape with 422');
  it.todo('answers the documented status for each error code of the use case');
});
