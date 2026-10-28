import { describe, expect, it } from '@jest/globals';
import { executeRoute } from '@ddd-ts-kit/http';
import { nestControllerRoute } from '@ddd-ts-kit/http/nest';
import { classSchema } from '@ddd-ts-kit/validation/class-validator';
import { InMemoryCommandBus, type Actor } from '@ddd-ts-kit/kernel';
import { AuthorizePayoutCommand } from '@/contexts/credit-application/offer/application/commands/authorize-payout/authorize-payout.command';
import { AuthorizePayoutController } from '@/contexts/credit-application/offer/presentation/http/applications/authorize-payout/authorize-payout.controller';
import { PayoutTooEarly } from '@/contexts/credit-application/offer/domain/errors/payout-too-early.error';
import { creditApplicationControllers } from '@/contexts/credit-application/credit-application.controllers';

const caller: Actor = { id: 'user-1', type: 'user', roles: [], attributes: {} };

describe('POST /applications/:id/payout-authorisation', () => {
  it('answers 204 when the use case succeeds', async () => {
    const commands = new InMemoryCommandBus().register(AuthorizePayoutCommand, {
      execute: async () => undefined,
    });

    const route = nestControllerRoute(AuthorizePayoutController, {
      instanceOf: () => new AuthorizePayoutController(commands),
      schemaOfClass: (dto) => classSchema(dto, { validator: { forbidUnknownValues: false } }),
    });

    const response = await executeRoute(
      route,
      { params: { id: 'id-1' }, query: {}, headers: {}, body: {}, raw: undefined },
      { validateResponses: true, resolvePrincipal: () => caller },
    );

    expect(response.status).toBe(204);
    expect(route.path).toBe('/applications/:id/payout-authorisation');
    expect(creditApplicationControllers).toContain(AuthorizePayoutController);
  });

  it('answers the refusal of the use case with its code, not a success', async () => {
    const commands = new InMemoryCommandBus().register(AuthorizePayoutCommand, {
      execute: async () => {
        throw PayoutTooEarly.forEarlyPayout(new Date('2026-04-10T09:00:00.000Z'));
      },
    });

    const route = nestControllerRoute(AuthorizePayoutController, {
      instanceOf: () => new AuthorizePayoutController(commands),
      schemaOfClass: (dto) => classSchema(dto, { validator: { forbidUnknownValues: false } }),
    });

    const response = await executeRoute(
      route,
      { params: { id: 'id-1' }, query: {}, headers: {}, body: {}, raw: undefined },
      { validateResponses: true, resolvePrincipal: () => caller },
    );

    expect(response.status).toBeGreaterThanOrEqual(400);
    expect(response.body).toMatchObject({ code: 'PAYOUT_TOO_EARLY' });
  });
});
