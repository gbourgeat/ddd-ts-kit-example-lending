import { describe, expect, it } from '@jest/globals';
import { executeRoute } from '@ddd-ts-kit/http';
import { nestControllerRoute } from '@ddd-ts-kit/http/nest';
import { classSchema } from '@ddd-ts-kit/validation/class-validator';
import { InMemoryQueryBus, type Actor } from '@ddd-ts-kit/kernel';
import { SearchApplicationsQuery } from '@/contexts/credit-application/file/application/queries/search-applications/search-applications.query';
import { SearchApplicationsController } from '@/contexts/credit-application/file/presentation/http/applications/search-applications/search-applications.controller';
import { creditApplicationControllers } from '@/contexts/credit-application/credit-application.controllers';

const caller: Actor = { id: 'user-1', type: 'user', roles: [], attributes: {} };

const APPLICATION = {
  id: 'application-1',
  applicantId: 'customer-1',
  requestedAmountCents: 1234567,
  durationMonths: 60,
};

describe('GET /applications', () => {
  it('answers 200 when the use case succeeds', async () => {
    const route = routeAnswering({ items: [APPLICATION], total: 1 });

    const response = await executeRoute(
      route,
      { params: {}, query: {}, headers: {}, body: {}, raw: undefined },
      { validateResponses: true, resolvePrincipal: () => caller },
    );

    expect(response.status).toBe(200);
    expect(route.path).toBe('/applications');
    expect(creditApplicationControllers).toContain(SearchApplicationsController);
  });

  it('answers each application with the four fields a client reads', async () => {
    const route = routeAnswering({ items: [APPLICATION], total: 1 });

    const response = await executeRoute(
      route,
      { params: {}, query: {}, headers: {}, body: {}, raw: undefined },
      { validateResponses: true, resolvePrincipal: () => caller },
    );

    expect(response.body).toEqual({ items: [APPLICATION], total: 1 });
  });
});

function routeAnswering(page: { readonly items: readonly (typeof APPLICATION)[]; readonly total: number }) {
  const queries = new InMemoryQueryBus().register(SearchApplicationsQuery, { execute: async () => page });

  return nestControllerRoute(SearchApplicationsController, {
    instanceOf: () => new SearchApplicationsController(queries),
    schemaOfClass: (dto) => classSchema(dto, { validator: { forbidUnknownValues: false } }),
  });
}
