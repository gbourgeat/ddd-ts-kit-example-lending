import { describe, expect, it } from '@jest/globals';
import { executeRoute } from '@ddd-ts-kit/http';
import { nestControllerRoute } from '@ddd-ts-kit/http/nest';
import { classSchema } from '@ddd-ts-kit/validation/class-validator';
import { InMemoryQueryBus, type Actor } from '@ddd-ts-kit/kernel';
import { GetLoanStatementQuery } from '@/contexts/servicing/ledger/application/queries/get-loan-statement/get-loan-statement.query';
import { GetLoanStatementController } from '@/contexts/servicing/ledger/presentation/http/loans/get-loan-statement/get-loan-statement.controller';
import { servicingControllers } from '@/contexts/servicing/servicing.controllers';

const caller: Actor = { id: 'user-1', type: 'user', roles: [], attributes: {} };
const AS_OF = '2026-03-15T00:00:00.000Z';

const STATEMENT = {
  loanId: 'id-1',
  asOf: AS_OF,
  outstandingCapitalCents: 95_000,
  arrearsCents: 0,
  daysPastDue: 0,
  instalmentsCents: [8_000],
  instalmentsDue: [1],
  instalmentsPaid: [1],
  instalmentsUnpaid: [],
};

describe('GET /loans/:id/statement', () => {
  it('answers 200 with the statement of the loan on the date', async () => {
    const response = await execute({ asOf: AS_OF });

    expect(response.status).toBe(200);
  });

  it('is served at the path of the loan statement, in the servicing contract', () => {
    const route = nestControllerRoute(GetLoanStatementController, {
      instanceOf: () => new GetLoanStatementController(new InMemoryQueryBus()),
      schemaOfClass: (dto) => classSchema(dto, { validator: { forbidUnknownValues: false } }),
    });

    expect(route.path).toBe('/loans/:id/statement');
    expect(servicingControllers).toContain(GetLoanStatementController);
  });

  it('refuses a date that is not an ISO instant with 422', async () => {
    const response = await execute({ asOf: 'the fifteenth of March' });

    expect(response.status).toBe(422);
  });
});

/** Runs the route on a query bus that answers the statement above, as the handler of the query would. */
function execute(query: { asOf: string }) {
  const queries = new InMemoryQueryBus().register(GetLoanStatementQuery, {
    execute: async () => STATEMENT,
  });

  const route = nestControllerRoute(GetLoanStatementController, {
    instanceOf: () => new GetLoanStatementController(queries),
    schemaOfClass: (dto) => classSchema(dto, { validator: { forbidUnknownValues: false } }),
  });

  return executeRoute(
    route,
    { params: { id: 'id-1' }, query, headers: {}, body: {}, raw: undefined },
    { validateResponses: true, resolvePrincipal: () => caller },
  );
}
