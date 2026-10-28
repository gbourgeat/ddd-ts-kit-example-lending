import { describe, expect, it } from '@jest/globals';
import { executeRoute } from '@ddd-ts-kit/http';
import { nestControllerRoute } from '@ddd-ts-kit/http/nest';
import { classSchema } from '@ddd-ts-kit/validation/class-validator';
import { InMemoryQueryBus, type Actor } from '@ddd-ts-kit/kernel';
import { ReadProductTermsQuery } from '@/contexts/credit-application/file/application/queries/read-product-terms/read-product-terms.query';
import { ReadProductTermsController } from '@/contexts/credit-application/file/presentation/http/product-terms/read-product-terms/read-product-terms.controller';
import { creditApplicationControllers } from '@/contexts/credit-application/credit-application.controllers';

const caller: Actor = { id: 'user-1', type: 'user', roles: [], attributes: {} };

const terms = {
  productId: 'product-id-1',
  amountMinimumCents: 100_000,
  amountMaximumCents: 2_500_000,
  durationMinimumMonths: 12,
  durationMaximumMonths: 84,
  arrangementFeeCents: 4_500,
  insuranceMandatory: true,
};

describe('GET /product-terms/:productId', () => {
  it('answers 200 with the terms of the product', async () => {
    const queries = new InMemoryQueryBus().register(ReadProductTermsQuery, {
      execute: async () => terms,
    });

    const route = nestControllerRoute(ReadProductTermsController, {
      instanceOf: () => new ReadProductTermsController(queries),
      schemaOfClass: (dto) => classSchema(dto),
    });

    const response = await executeRoute(
      route,
      { params: { productId: 'product-id-1' }, query: {}, headers: {}, body: {}, raw: undefined },
      { validateResponses: true, resolvePrincipal: () => caller },
    );

    expect(response.status).toBe(200);
    expect(response.body).toEqual(terms);
    expect(route.path).toBe('/product-terms/:productId');
    expect(creditApplicationControllers).toContain(ReadProductTermsController);
  });
});
