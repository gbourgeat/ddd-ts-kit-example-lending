import { describe, expect, it } from '@jest/globals';
import { executeRoute } from '@ddd-ts-kit/http';
import { nestControllerRoute } from '@ddd-ts-kit/http/nest';
import { classSchema } from '@ddd-ts-kit/validation/class-validator';
import { InMemoryQueryBus, type Actor } from '@ddd-ts-kit/kernel';
import { ReadPortfolioAtRiskQuery } from '@/contexts/servicing/arrears/application/queries/read-portfolio-at-risk/read-portfolio-at-risk.query';
import { ReadPortfolioAtRiskController } from '@/contexts/servicing/arrears/presentation/http/loans/read-portfolio-at-risk/read-portfolio-at-risk.controller';
import { servicingControllers } from '@/contexts/servicing/servicing.controllers';

const caller: Actor = { id: 'user-1', type: 'user', roles: [], attributes: {} };

const ANSWER = {
  buckets: [{ bucket: 'None', loans: 2, principalCents: 200_000 }],
  openPrincipalCents: 200_000,
  atRiskBasisPoints: 0,
};

describe('GET /loans/portfolio-at-risk', () => {
  it('answers 200 with the buckets, the open principal and the share at risk the query computed', async () => {
    const response = await readRoute(async () => ANSWER);

    expect(response.status).toBe(200);
    expect(response.body).toEqual(ANSWER);
  });

  it('is served under the loans routes and listed by the context controllers', async () => {
    const route = routeWith(async () => ANSWER);

    expect(route.path).toBe('/loans/portfolio-at-risk');
    expect(servicingControllers).toContain(ReadPortfolioAtRiskController);
  });
});

function routeWith(execute: () => Promise<typeof ANSWER>) {
  const queries = new InMemoryQueryBus().register(ReadPortfolioAtRiskQuery, { execute });

  return nestControllerRoute(ReadPortfolioAtRiskController, {
    instanceOf: () => new ReadPortfolioAtRiskController(queries),
    // The route takes no input: the empty object is the only one it accepts.
    schemaOfClass: (dto) => classSchema(dto, { validator: { forbidUnknownValues: false } }),
  });
}

function readRoute(execute: () => Promise<typeof ANSWER>) {
  return executeRoute(
    routeWith(execute),
    { params: {}, query: {}, headers: {}, body: {}, raw: undefined },
    { validateResponses: true, resolvePrincipal: () => caller },
  );
}
