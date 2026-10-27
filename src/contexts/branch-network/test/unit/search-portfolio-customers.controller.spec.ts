import { describe, expect, it } from '@jest/globals';
import { executeRoute } from '@ddd-ts-kit/http';
import { nestControllerRoute } from '@ddd-ts-kit/http/nest';
import { classSchema } from '@ddd-ts-kit/validation/class-validator';
import { InMemoryQueryBus, type Actor } from '@ddd-ts-kit/kernel';
import { UnknownPortfolio } from '@/contexts/branch-network/domain/errors/unknown-portfolio.error';
import { SearchPortfolioCustomersQuery } from '@/contexts/branch-network/application/queries/search-portfolio-customers/search-portfolio-customers.query';
import { SearchPortfolioCustomersController } from '@/contexts/branch-network/presentation/http/portfolios/search-portfolio-customers/search-portfolio-customers.controller';
import { branchNetworkControllers } from '@/contexts/branch-network/branch-network.controllers';

const caller: Actor = { id: 'user-1', type: 'user', roles: [], attributes: {} };

describe('GET /portfolios/:id/customers', () => {
  it('answers 200 when the use case succeeds', async () => {
    const queries = new InMemoryQueryBus().register(SearchPortfolioCustomersQuery, {
      execute: async () => ({ items: [{ id: 'search-portfolio-customers-1' }], total: 1 }),
    });

    const route = nestControllerRoute(SearchPortfolioCustomersController, {
      instanceOf: () => new SearchPortfolioCustomersController(queries),
      // A DTO without a decorated field yet accepts the empty object alone: whitelist and forbidNonWhitelisted refuse any field.
      schemaOfClass: (dto) => classSchema(dto, { validator: { forbidUnknownValues: false } }),
    });

    const response = await executeRoute(
      route,
      { params: { id: 'id-1' }, query: {}, headers: {}, body: {}, raw: undefined },
      { validateResponses: true, resolvePrincipal: () => caller },
    );

    expect(response.status).toBe(200);
    expect(route.path).toBe('/portfolios/:id/customers');
    expect(branchNetworkControllers).toContain(SearchPortfolioCustomersController);
  });

  it('refuses a page larger than the maximum size with 422, and reads no customer', async () => {
    const queries = new InMemoryQueryBus().register(SearchPortfolioCustomersQuery, {
      execute: async () => ({ items: [], total: 0 }),
    });

    const route = nestControllerRoute(SearchPortfolioCustomersController, {
      instanceOf: () => new SearchPortfolioCustomersController(queries),
      schemaOfClass: (dto) => classSchema(dto, { validator: { forbidUnknownValues: false } }),
    });

    const response = await executeRoute(
      route,
      { params: { id: 'id-1' }, query: { limit: '101' }, headers: {}, body: {}, raw: undefined },
      { validateResponses: true, resolvePrincipal: () => caller },
    );

    expect(response.status).toBe(422);
  });

  it('answers 422 when the portfolio is unknown, with the code UNKNOWN_PORTFOLIO', async () => {
    const queries = new InMemoryQueryBus().register(SearchPortfolioCustomersQuery, {
      execute: async (query) => {
        throw UnknownPortfolio.forPortfolio(query.portfolioId);
      },
    });

    const route = nestControllerRoute(SearchPortfolioCustomersController, {
      instanceOf: () => new SearchPortfolioCustomersController(queries),
      schemaOfClass: (dto) => classSchema(dto, { validator: { forbidUnknownValues: false } }),
    });

    const response = await executeRoute(
      route,
      { params: { id: 'portfolio-9' }, query: {}, headers: {}, body: {}, raw: undefined },
      { validateResponses: true, resolvePrincipal: () => caller },
    );

    expect(response.status).toBe(422);
  });
});
