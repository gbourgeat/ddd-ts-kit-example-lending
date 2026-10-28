import { describe, expect, it } from '@jest/globals';
import { executeRoute } from '@ddd-ts-kit/http';
import { nestControllerRoute } from '@ddd-ts-kit/http/nest';
import { classSchema } from '@ddd-ts-kit/validation/class-validator';
import { InMemoryCommandBus, type Actor } from '@ddd-ts-kit/kernel';
import { AcceptOfferCommand } from '@/contexts/credit-application/offer/application/commands/accept-offer/accept-offer.command';
import { AcceptOfferController } from '@/contexts/credit-application/offer/presentation/http/offers/accept-offer/accept-offer.controller';
import { OfferExpired } from '@/contexts/credit-application/offer/domain/errors/offer-expired.error';
import { creditApplicationControllers } from '@/contexts/credit-application/credit-application.controllers';

const caller: Actor = { id: 'user-1', type: 'user', roles: [], attributes: {} };
const expiredOn = new Date('2026-04-16T00:00:00.000Z');

describe('POST /offers/:id/acceptance', () => {
  it('answers 204 when the use case succeeds', async () => {
    const commands = new InMemoryCommandBus().register(AcceptOfferCommand, {
      execute: async () => undefined,
    });

    const route = nestControllerRoute(AcceptOfferController, {
      instanceOf: () => new AcceptOfferController(commands),
      // A DTO without a decorated field yet accepts the empty object alone: whitelist and forbidNonWhitelisted refuse any field.
      schemaOfClass: (dto) => classSchema(dto, { validator: { forbidUnknownValues: false } }),
    });

    const response = await executeRoute(
      route,
      { params: { id: 'id-1' }, query: {}, headers: {}, body: {}, raw: undefined },
      { validateResponses: true, resolvePrincipal: () => caller },
    );

    expect(response.status).toBe(204);
    expect(route.path).toBe('/offers/:id/acceptance');
    expect(creditApplicationControllers).toContain(AcceptOfferController);
  });

  it('passes the offer named by the path to the use case, with the caller as the signer', async () => {
    const received: AcceptOfferCommand[] = [];

    const commands = new InMemoryCommandBus().register(AcceptOfferCommand, {
      execute: async (command: AcceptOfferCommand) => {
        received.push(command);
      },
    });

    const route = nestControllerRoute(AcceptOfferController, {
      instanceOf: () => new AcceptOfferController(commands),
      schemaOfClass: (dto) => classSchema(dto, { validator: { forbidUnknownValues: false } }),
    });

    await executeRoute(
      route,
      { params: { id: 'id-1' }, query: {}, headers: {}, body: {}, raw: undefined },
      { validateResponses: true, resolvePrincipal: () => caller },
    );

    expect(received).toMatchObject([{ offerId: 'id-1', actor: { id: 'user-1' } }]);
  });

  it('answers the refusal of the use case by its code, the expiry of the offer as its fact', async () => {
    const commands = new InMemoryCommandBus().register(AcceptOfferCommand, {
      execute: async () => {
        throw OfferExpired.forExpiry('id-1', expiredOn);
      },
    });

    const route = nestControllerRoute(AcceptOfferController, {
      instanceOf: () => new AcceptOfferController(commands),
      schemaOfClass: (dto) => classSchema(dto, { validator: { forbidUnknownValues: false } }),
    });

    const response = await executeRoute(
      route,
      { params: { id: 'id-1' }, query: {}, headers: {}, body: {}, raw: undefined },
      { validateResponses: true, resolvePrincipal: () => caller },
    );

    expect(response.body).toMatchObject({ code: 'OFFER_EXPIRED' });
  });
});
