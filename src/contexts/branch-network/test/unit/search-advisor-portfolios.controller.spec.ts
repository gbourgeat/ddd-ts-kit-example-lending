import { describe, expect, it } from '@jest/globals';
import { executeRoute } from '@ddd-ts-kit/http';
import { nestControllerRoute } from '@ddd-ts-kit/http/nest';
import { classSchema } from '@ddd-ts-kit/validation/class-validator';
import { InMemoryQueryBus, type Actor } from '@ddd-ts-kit/kernel';
import { SearchAdvisorPortfoliosQuery } from '@/contexts/branch-network/application/queries/search-advisor-portfolios/search-advisor-portfolios.query';
import { SearchAdvisorPortfoliosController } from '@/contexts/branch-network/presentation/http/portfolios/search-advisor-portfolios/search-advisor-portfolios.controller';
import { branchNetworkControllers } from '@/contexts/branch-network/branch-network.controllers';

const caller: Actor = { id: 'user-1', type: 'user', roles: [], attributes: {} };

describe('GET /portfolios', () => {
  it('answers 200 when the use case succeeds', async () => {
    const queries = new InMemoryQueryBus().register(SearchAdvisorPortfoliosQuery, {
      execute: async () => ({ items: [{ id: 'portfolio-1' }], total: 1 }),
    });

    const route = nestControllerRoute(SearchAdvisorPortfoliosController, {
      instanceOf: () => new SearchAdvisorPortfoliosController(queries),
      schemaOfClass: (dto) => classSchema(dto, { validator: { forbidUnknownValues: false } }),
    });

    const response = await executeRoute(
      route,
      { params: {}, query: {}, headers: {}, body: {}, raw: undefined },
      { validateResponses: true, resolvePrincipal: () => caller },
    );

    expect(response.status).toBe(200);
    expect(route.path).toBe('/portfolios');
    expect(branchNetworkControllers).toContain(SearchAdvisorPortfoliosController);
  });

  it('refuses a page larger than the maximum size with 422', async () => {
    const queries = new InMemoryQueryBus().register(SearchAdvisorPortfoliosQuery, {
      execute: async () => ({ items: [], total: 0 }),
    });

    const route = nestControllerRoute(SearchAdvisorPortfoliosController, {
      instanceOf: () => new SearchAdvisorPortfoliosController(queries),
      schemaOfClass: (dto) => classSchema(dto, { validator: { forbidUnknownValues: false } }),
    });

    const response = await executeRoute(
      route,
      { params: {}, query: { limit: '101' }, headers: {}, body: {}, raw: undefined },
      { validateResponses: true, resolvePrincipal: () => caller },
    );

    expect(response.status).toBe(422);
  });

  it('answers 200 with an empty page when the advisor holds no portfolio', async () => {
    const queries = new InMemoryQueryBus().register(SearchAdvisorPortfoliosQuery, {
      execute: async () => ({ items: [], total: 0 }),
    });

    const route = nestControllerRoute(SearchAdvisorPortfoliosController, {
      instanceOf: () => new SearchAdvisorPortfoliosController(queries),
      schemaOfClass: (dto) => classSchema(dto, { validator: { forbidUnknownValues: false } }),
    });

    const response = await executeRoute(
      route,
      { params: {}, query: {}, headers: {}, body: {}, raw: undefined },
      { validateResponses: true, resolvePrincipal: () => caller },
    );

    expect(response.status).toBe(200);
  });
});
