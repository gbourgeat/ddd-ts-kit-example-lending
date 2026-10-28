import { describe, expect, it } from '@jest/globals';
import { executeRoute } from '@ddd-ts-kit/http';
import { nestControllerRoute } from '@ddd-ts-kit/http/nest';
import { classSchema } from '@ddd-ts-kit/validation/class-validator';
import { InMemoryQueryBus, type Actor } from '@ddd-ts-kit/kernel';
import { GetSuspiciousActivityReportQuery } from '@/contexts/financial-crime/application/queries/get-suspicious-activity-report/get-suspicious-activity-report.query';
import { GetSuspiciousActivityReportController } from '@/contexts/financial-crime/presentation/http/reports/get-suspicious-activity-report/get-suspicious-activity-report.controller';
import { financialCrimeControllers } from '@/contexts/financial-crime/financial-crime.controllers';

const caller: Actor = { id: 'user-1', type: 'user', roles: [], attributes: {} };

describe('GET /suspicious-activity-reports/:id', () => {
  it('answers 200 with the identifier of the report the use case shows', async () => {
    const queries = new InMemoryQueryBus().register(GetSuspiciousActivityReportQuery, {
      execute: async () => ({ id: 'id-1' }),
    });

    const route = nestControllerRoute(GetSuspiciousActivityReportController, {
      instanceOf: () => new GetSuspiciousActivityReportController(queries),
      schemaOfClass: (dto) => classSchema(dto, { validator: { forbidUnknownValues: false } }),
    });

    const response = await executeRoute(
      route,
      { params: { id: 'id-1' }, query: {}, headers: {}, body: {}, raw: undefined },
      { validateResponses: true, resolvePrincipal: () => caller },
    );

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ id: 'id-1' });
    expect(route.path).toBe('/suspicious-activity-reports/:id');
    expect(financialCrimeControllers).toContain(GetSuspiciousActivityReportController);
  });
});
