import { describe, expect, it } from '@jest/globals';
import { executeRoute } from '@ddd-ts-kit/http';
import { nestControllerRoute } from '@ddd-ts-kit/http/nest';
import { classSchema } from '@ddd-ts-kit/validation/class-validator';
import { InMemoryQueryBus, type Actor } from '@ddd-ts-kit/kernel';
import { DefaultedLoansQuery } from '@/contexts/reporting/application/queries/defaulted-loans/defaulted-loans.query';
import type { DefaultedLoansResult } from '@/contexts/reporting/application/queries/defaulted-loans/defaulted-loans.result';
import { DefaultedLoansController } from '@/contexts/reporting/presentation/http/reports/defaulted-loans/defaulted-loans.controller';
import { reportingControllers } from '@/contexts/reporting/reporting.controllers';

const caller: Actor = { id: 'user-1', type: 'user', roles: [], attributes: {} };

describe('GET /reports/defaulted-loans', () => {
  it('answers 200 with the loans of the use case when it succeeds', async () => {
    const queries = queryBusAnswering({ loans: [] });

    const response = await callRoute(queries);

    expect(response.status).toBe(200);
    expect(reportingControllers).toContain(DefaultedLoansController);
  });

  it('answers each loan line of the use case with the public fields only', async () => {
    const result: DefaultedLoansResult = {
      loans: [
        {
          loanId: 'loan-1',
          branchId: 'branch-1',
          principalCents: 100_000,
          defaultedAt: '2026-03-05T00:00:00.000Z',
        },
      ],
    };

    const response = await callRoute(queryBusAnswering(result));

    expect(response.body).toEqual({ loans: result.loans });
  });
});

function queryBusAnswering(result: DefaultedLoansResult): InMemoryQueryBus {
  return new InMemoryQueryBus().register(DefaultedLoansQuery, {
    execute: async () => result,
  });
}

async function callRoute(queries: InMemoryQueryBus) {
  const route = nestControllerRoute(DefaultedLoansController, {
    instanceOf: () => new DefaultedLoansController(queries),
    schemaOfClass: (dto) => classSchema(dto, { validator: { forbidUnknownValues: false } }),
  });

  return executeRoute(
    route,
    { params: {}, query: {}, headers: {}, body: {}, raw: undefined },
    { validateResponses: true, resolvePrincipal: () => caller },
  );
}
