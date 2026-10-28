import { describe, expect, it } from '@jest/globals';
import { executeRoute } from '@ddd-ts-kit/http';
import { nestControllerRoute } from '@ddd-ts-kit/http/nest';
import { classSchema } from '@ddd-ts-kit/validation/class-validator';
import { InMemoryQueryBus, type Actor } from '@ddd-ts-kit/kernel';
import { ReadLegalMaximumRateQuery } from '@/contexts/credit-application/offer/application/queries/read-legal-maximum-rate/read-legal-maximum-rate.query';
import { ReadLegalMaximumRateController } from '@/contexts/credit-application/offer/presentation/http/legal-maximum-rates/read-legal-maximum-rate/read-legal-maximum-rate.controller';
import { creditApplicationControllers } from '@/contexts/credit-application/credit-application.controllers';

const caller: Actor = { id: 'user-1', type: 'user', roles: [], attributes: {} };

describe('GET /legal-maximum-rates/:legalMaximumRateId', () => {
  it('answers 200 with the rate of the maximum the use case found', async () => {
    const queries = new InMemoryQueryBus().register(ReadLegalMaximumRateQuery, {
      execute: async () => ({
        legalMaximumRateId: 'maximum-id-1',
        category: 'car',
        rateBasisPoints: 1250,
        effectiveFrom: '2026-01-01T00:00:00.000Z',
      }),
    });

    const route = nestControllerRoute(ReadLegalMaximumRateController, {
      instanceOf: () => new ReadLegalMaximumRateController(queries),
      // A DTO without a decorated field yet accepts the empty object alone: whitelist and forbidNonWhitelisted refuse any field.
      schemaOfClass: (dto) => classSchema(dto, { validator: { forbidUnknownValues: false } }),
    });

    const response = await executeRoute(
      route,
      { params: { legalMaximumRateId: 'maximum-id-1' }, query: {}, headers: {}, body: {}, raw: undefined },
      { validateResponses: true, resolvePrincipal: () => caller },
    );

    expect(response.status).toBe(200);

    expect(response.body).toEqual({
      legalMaximumRateId: 'maximum-id-1',
      category: 'car',
      rateBasisPoints: 1250,
      effectiveFrom: '2026-01-01T00:00:00.000Z',
    });

    expect(route.path).toBe('/legal-maximum-rates/:legalMaximumRateId');
    expect(creditApplicationControllers).toContain(ReadLegalMaximumRateController);
  });

  it('refuses an input that does not have the expected shape with 422', async () => {
    const queries = new InMemoryQueryBus();

    const route = nestControllerRoute(ReadLegalMaximumRateController, {
      instanceOf: () => new ReadLegalMaximumRateController(queries),
      schemaOfClass: (dto) => classSchema(dto, { validator: { forbidUnknownValues: false } }),
    });

    const response = await executeRoute(
      route,
      { params: { legalMaximumRateId: 42 }, query: {}, headers: {}, body: {}, raw: undefined },
      { validateResponses: true, resolvePrincipal: () => caller },
    );

    expect(response.status).toBe(422);
  });
});
