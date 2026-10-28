import { describe, expect, it } from '@jest/globals';
import { executeRoute } from '@ddd-ts-kit/http';
import { nestControllerRoute } from '@ddd-ts-kit/http/nest';
import { classSchema } from '@ddd-ts-kit/validation/class-validator';
import { InMemoryQueryBus, type Actor } from '@ddd-ts-kit/kernel';
import { DefaultsListQuery } from '@/contexts/reporting/application/queries/defaults-list/defaults-list.query';
import type { DefaultsListResult } from '@/contexts/reporting/application/queries/defaults-list/defaults-list.result';
import { DefaultsListController } from '@/contexts/reporting/presentation/http/reports/defaults-list/defaults-list.controller';
import { reportingControllers } from '@/contexts/reporting/reporting.controllers';

const caller: Actor = { id: 'user-1', type: 'user', roles: [], attributes: {} };

const defaulted: DefaultsListResult = {
  loans: [{ loanId: 'loan-1', branchId: 'branch-1', principalCents: 100_000, defaultedAt: '2026-03-05T00:00:00.000Z' }],
};

describe('GET /reports/defaults', () => {
  it('answers 200 when the use case succeeds', async () => {
    const response = await answerTo({ loans: [] });

    expect(response.status).toBe(200);
  });

  it('is served under its path and listed among the controllers of reporting', async () => {
    const route = routeWith({ loans: [] });

    expect(route.path).toBe('/reports/defaults');
    expect(reportingControllers).toContain(DefaultsListController);
  });

  it('answers each loan in default as an item with its branch, principal and default instant', async () => {
    const response = await answerTo(defaulted);

    expect(response.body).toEqual({
      items: [
        {
          loanId: 'loan-1',
          branchId: 'branch-1',
          principalCents: 100_000,
          defaultedAt: '2026-03-05T00:00:00.000Z',
        },
      ],
    });
  });

  it('answers an empty page when no loan is in default', async () => {
    const response = await answerTo({ loans: [] });

    expect(response.body).toEqual({ items: [] });
  });
});

async function answerTo(result: DefaultsListResult) {
  return executeRoute(
    routeWith(result),
    { params: {}, query: {}, headers: {}, body: {}, raw: undefined },
    { validateResponses: true, resolvePrincipal: () => caller },
  );
}

function routeWith(result: DefaultsListResult) {
  const queries = new InMemoryQueryBus().register(DefaultsListQuery, {
    execute: async () => result,
  });

  return nestControllerRoute(DefaultsListController, {
    instanceOf: () => new DefaultsListController(queries),
    // A DTO without a decorated field yet accepts the empty object alone: whitelist and forbidNonWhitelisted refuse any field.
    schemaOfClass: (dto) => classSchema(dto, { validator: { forbidUnknownValues: false } }),
  });
}
