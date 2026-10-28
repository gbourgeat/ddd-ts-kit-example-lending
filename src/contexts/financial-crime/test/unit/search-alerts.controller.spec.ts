import { describe, expect, it } from '@jest/globals';
import { executeRoute } from '@ddd-ts-kit/http';
import { nestControllerRoute } from '@ddd-ts-kit/http/nest';
import { classSchema } from '@ddd-ts-kit/validation/class-validator';
import { InMemoryQueryBus, type Actor } from '@ddd-ts-kit/kernel';
import { SearchAlertsQuery } from '@/contexts/financial-crime/application/queries/search-alerts/search-alerts.query';
import { SearchAlertsController } from '@/contexts/financial-crime/presentation/http/alerts/search-alerts/search-alerts.controller';
import { financialCrimeControllers } from '@/contexts/financial-crime/financial-crime.controllers';

const caller: Actor = { id: 'user-1', type: 'user', roles: [], attributes: {} };

describe('GET /alerts', () => {
  it('answers 200 with each alert of the page and its repayment reference', async () => {
    const queries = new InMemoryQueryBus().register(SearchAlertsQuery, {
      execute: async () => ({ items: [{ id: 'alert-1', repaymentReference: 'repayment-1' }], total: 1 }),
    });

    const route = nestControllerRoute(SearchAlertsController, {
      instanceOf: () => new SearchAlertsController(queries),
      schemaOfClass: (dto) => classSchema(dto, { validator: { forbidUnknownValues: false } }),
    });

    const response = await executeRoute(
      route,
      { params: {}, query: {}, headers: {}, body: {}, raw: undefined },
      { validateResponses: true, resolvePrincipal: () => caller },
    );

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ items: [{ id: 'alert-1', repaymentReference: 'repayment-1' }] });
    expect(route.path).toBe('/alerts');
    expect(financialCrimeControllers).toContain(SearchAlertsController);
  });

  it('answers the total of the page the use case gives, with no alert of its own', async () => {
    const queries = new InMemoryQueryBus().register(SearchAlertsQuery, {
      execute: async () => ({ items: [], total: 0 }),
    });

    const route = nestControllerRoute(SearchAlertsController, {
      instanceOf: () => new SearchAlertsController(queries),
      schemaOfClass: (dto) => classSchema(dto, { validator: { forbidUnknownValues: false } }),
    });

    const response = await executeRoute(
      route,
      { params: {}, query: {}, headers: {}, body: {}, raw: undefined },
      { validateResponses: true, resolvePrincipal: () => caller },
    );

    expect(response.body).toMatchObject({ items: [], total: 0 });
  });
});
