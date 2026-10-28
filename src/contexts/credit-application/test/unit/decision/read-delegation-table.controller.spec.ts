import { describe, expect, it } from '@jest/globals';
import { executeRoute } from '@ddd-ts-kit/http';
import { nestControllerRoute } from '@ddd-ts-kit/http/nest';
import { classSchema } from '@ddd-ts-kit/validation/class-validator';
import { InMemoryQueryBus, type Actor } from '@ddd-ts-kit/kernel';
import { ReadDelegationTableQuery } from '@/contexts/credit-application/decision/application/queries/read-delegation-table/read-delegation-table.query';
import { ReadDelegationTableController } from '@/contexts/credit-application/decision/presentation/http/delegation-tables/read-delegation-table/read-delegation-table.controller';
import { creditApplicationControllers } from '@/contexts/credit-application/credit-application.controllers';

const caller: Actor = { id: 'user-1', type: 'user', roles: [], attributes: {} };

describe('GET /delegation-tables/:delegationTableId', () => {
  it('answers 200 with the levels of the table the use case found', async () => {
    const queries = new InMemoryQueryBus().register(ReadDelegationTableQuery, {
      execute: async () => ({
        delegationTableId: 'delegation-table-id-1',
        effectiveFrom: '2026-01-01T00:00:00.000Z',
        levels: [{ level: 'level-1', amountCents: 500000 }],
      }),
    });

    const route = nestControllerRoute(ReadDelegationTableController, {
      instanceOf: () => new ReadDelegationTableController(queries),
      // A DTO without a decorated field yet accepts the empty object alone: whitelist and forbidNonWhitelisted refuse any field.
      schemaOfClass: (dto) => classSchema(dto, { validator: { forbidUnknownValues: false } }),
    });

    const response = await executeRoute(
      route,
      { params: { delegationTableId: 'delegation-table-id-1' }, query: {}, headers: {}, body: {}, raw: undefined },
      { validateResponses: true, resolvePrincipal: () => caller },
    );

    expect(response.status).toBe(200);

    expect(response.body).toEqual({
      delegationTableId: 'delegation-table-id-1',
      effectiveFrom: '2026-01-01T00:00:00.000Z',
      levels: [{ level: 'level-1', amountCents: 500000 }],
    });

    expect(route.path).toBe('/delegation-tables/:delegationTableId');
    expect(creditApplicationControllers).toContain(ReadDelegationTableController);
  });

  // TODO(domain): replace the entry below by a test of the contract a client relies on: an input that does not have the expected shape is refused with 422.
  it.todo('refuses an input that does not have the expected shape with 422');
});
