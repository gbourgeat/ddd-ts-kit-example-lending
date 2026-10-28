import { describe, expect, it } from '@jest/globals';
import { executeRoute } from '@ddd-ts-kit/http';
import { nestControllerRoute } from '@ddd-ts-kit/http/nest';
import { classSchema } from '@ddd-ts-kit/validation/class-validator';
import { InMemoryQueryBus, type Actor } from '@ddd-ts-kit/kernel';
import { ReadRateGridQuery } from '@/contexts/credit-application/offer/application/queries/read-rate-grid/read-rate-grid.query';
import { ReadRateGridController } from '@/contexts/credit-application/offer/presentation/http/rate-grids/read-rate-grid/read-rate-grid.controller';
import { creditApplicationControllers } from '@/contexts/credit-application/credit-application.controllers';

const caller: Actor = { id: 'user-1', type: 'user', roles: [], attributes: {} };

describe('GET /rate-grids/:rateGridId', () => {
  it('answers 200 with the product and the day of the grid the use case found', async () => {
    const queries = new InMemoryQueryBus().register(ReadRateGridQuery, {
      execute: async () => ({
        rateGridId: 'rate-grid-id-1',
        productId: 'personal-loan',
        effectiveFrom: '2026-01-01T00:00:00.000Z',
        rates: [{ upToMonths: 36, rateBasisPoints: 590 }],
      }),
    });

    const route = nestControllerRoute(ReadRateGridController, {
      instanceOf: () => new ReadRateGridController(queries),
      // A DTO without a decorated field yet accepts the empty object alone: whitelist and forbidNonWhitelisted refuse any field.
      schemaOfClass: (dto) => classSchema(dto, { validator: { forbidUnknownValues: false } }),
    });

    const response = await executeRoute(
      route,
      { params: { rateGridId: 'rate-grid-id-1' }, query: {}, headers: {}, body: {}, raw: undefined },
      { validateResponses: true, resolvePrincipal: () => caller },
    );

    expect(response.status).toBe(200);

    expect(response.body).toEqual({
      rateGridId: 'rate-grid-id-1',
      productId: 'personal-loan',
      effectiveFrom: '2026-01-01T00:00:00.000Z',
      rates: [{ upToMonths: 36, rateBasisPoints: 590 }],
    });

    expect(route.path).toBe('/rate-grids/:rateGridId');
    expect(creditApplicationControllers).toContain(ReadRateGridController);
  });

  it('refuses an input that does not have the expected shape with 422', async () => {
    const queries = new InMemoryQueryBus();

    const route = nestControllerRoute(ReadRateGridController, {
      instanceOf: () => new ReadRateGridController(queries),
      schemaOfClass: (dto) => classSchema(dto, { validator: { forbidUnknownValues: false } }),
    });

    const response = await executeRoute(
      route,
      { params: { rateGridId: 42 }, query: {}, headers: {}, body: {}, raw: undefined },
      { validateResponses: true, resolvePrincipal: () => caller },
    );

    expect(response.status).toBe(422);
  });
});
