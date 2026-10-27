import { describe, expect, it } from '@jest/globals';
import { executeRoute } from '@ddd-ts-kit/http';
import { nestControllerRoute } from '@ddd-ts-kit/http/nest';
import { classSchema } from '@ddd-ts-kit/validation/class-validator';
import { InMemoryQueryBus, type Actor } from '@ddd-ts-kit/kernel';
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

  // TODO(domain): replace each entry below by a test of the contract a client relies on.
  it.todo('refuses an input that does not have the expected shape with 422');
  it.todo('answers the documented status for each error code of the use case');
});
