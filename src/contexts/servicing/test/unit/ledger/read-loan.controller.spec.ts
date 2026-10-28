import { ArrearsBucket } from '@/contexts/servicing/arrears/domain/vocabularies/arrears-bucket.vocabulary';
import { describe, expect, it } from '@jest/globals';
import { executeRoute } from '@ddd-ts-kit/http';
import { nestControllerRoute } from '@ddd-ts-kit/http/nest';
import { classSchema } from '@ddd-ts-kit/validation/class-validator';
import { InMemoryQueryBus, type Actor } from '@ddd-ts-kit/kernel';
import { ReadLoanQuery } from '@/contexts/servicing/ledger/application/queries/read-loan/read-loan.query';
import { ReadLoanController } from '@/contexts/servicing/ledger/presentation/http/loans/read-loan/read-loan.controller';
import { servicingControllers } from '@/contexts/servicing/servicing.controllers';

const caller: Actor = { id: 'user-1', type: 'user', roles: [], attributes: {} };

describe('GET /loans/:id', () => {
  it('answers 200 when the use case succeeds', async () => {
    const queries = new InMemoryQueryBus().register(ReadLoanQuery, {
      execute: async () => ({
        loanId: 'id-1',
        status: 'paid-out' as const,
        principalCents: 100_000,
        annualRateBasisPoints: 500,
        durationMonths: 12,
        instalmentsCents: [8_560],
        instalmentsDue: [1],
        instalmentsPaid: [1],
        instalmentsUnpaid: [],
        arrearsBucket: ArrearsBucket.None,
        defaulted: false,
      }),
    });

    const route = nestControllerRoute(ReadLoanController, {
      instanceOf: () => new ReadLoanController(queries),
      // A DTO without a decorated field yet accepts the empty object alone: whitelist and forbidNonWhitelisted refuse any field.
      schemaOfClass: (dto) => classSchema(dto, { validator: { forbidUnknownValues: false } }),
    });

    const response = await executeRoute(
      route,
      { params: { id: 'id-1' }, query: {}, headers: {}, body: {}, raw: undefined },
      { validateResponses: true, resolvePrincipal: () => caller },
    );

    expect(response.status).toBe(200);
    expect(route.path).toBe('/loans/:id');
    expect(servicingControllers).toContain(ReadLoanController);
  });

  // TODO(domain): replace each entry below by a test of the contract a client relies on.
  it.todo('refuses an input that does not have the expected shape with 422');
  it.todo('answers the documented status for each error code of the use case');
});
