import { describe, expect, it } from '@jest/globals';
import { executeRoute } from '@ddd-ts-kit/http';
import { nestControllerRoute } from '@ddd-ts-kit/http/nest';
import { classSchema } from '@ddd-ts-kit/validation/class-validator';
import { InMemoryQueryBus, type Actor } from '@ddd-ts-kit/kernel';
import { MonthlyReportQuery } from '@/contexts/reporting/application/queries/monthly-report/monthly-report.query';
import { MonthlyReportController } from '@/contexts/reporting/presentation/http/reports/monthly-report/monthly-report.controller';
import { reportingControllers } from '@/contexts/reporting/reporting.controllers';

const caller: Actor = { id: 'user-1', type: 'user', roles: [], attributes: {} };

const LINE = {
  id: 'branch-1',
  branchId: 'branch-1',
  month: '2026-03',
  applicationCount: 2,
  applicationAmountCents: 3500,
  decisionCount: 2,
  approvalCount: 1,
  exceptionCount: 0,
  approvalRateBasisPoints: 5000,
  exceptionShareBasisPoints: 0,
  portfolioAtRiskBasisPoints: 0,
};

describe('GET /reports/monthly', () => {
  it('answers 200 with the lines of the month, one per branch, without the internal id', async () => {
    const queries = new InMemoryQueryBus().register(MonthlyReportQuery, {
      execute: async () => ({ items: [LINE], total: 1 }),
    });

    const response = await executeRoute(
      routeOf(queries),
      { params: {}, query: { month: '2026-03' }, headers: {}, body: {}, raw: undefined },
      { validateResponses: true, resolvePrincipal: () => caller },
    );

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ items: [expect.not.objectContaining({ id: 'branch-1' })], total: 1 });
    expect(reportingControllers).toContain(MonthlyReportController);
  });

  it('refuses a month that is not YYYY-MM with 422', async () => {
    const queries = new InMemoryQueryBus().register(MonthlyReportQuery, {
      execute: async () => ({ items: [], total: 0 }),
    });

    const response = await executeRoute(
      routeOf(queries),
      { params: {}, query: { month: '2026-13' }, headers: {}, body: {}, raw: undefined },
      { validateResponses: true, resolvePrincipal: () => caller },
    );

    expect(response.status).toBe(422);
  });
});

function routeOf(queries: InMemoryQueryBus) {
  return nestControllerRoute(MonthlyReportController, {
    instanceOf: () => new MonthlyReportController(queries),
    schemaOfClass: (dto) => classSchema(dto, { validator: { forbidUnknownValues: false } }),
  });
}
