import { describe, expect, it } from '@jest/globals';
import { executeRoute } from '@ddd-ts-kit/http';
import { nestControllerRoute } from '@ddd-ts-kit/http/nest';
import { classSchema } from '@ddd-ts-kit/validation/class-validator';
import { InMemoryQueryBus, type Actor } from '@ddd-ts-kit/kernel';
import { PortfolioAtRiskPerBranchQuery } from '@/contexts/reporting/application/queries/portfolio-at-risk-per-branch/portfolio-at-risk-per-branch.query';
import type { PortfolioAtRiskPerBranchResult } from '@/contexts/reporting/application/queries/portfolio-at-risk-per-branch/portfolio-at-risk-per-branch.result';
import { PortfolioAtRiskPerBranchController } from '@/contexts/reporting/presentation/http/reports/portfolio-at-risk-per-branch/portfolio-at-risk-per-branch.controller';
import { reportingControllers } from '@/contexts/reporting/reporting.controllers';

const caller: Actor = { id: 'user-1', type: 'user', roles: [], attributes: {} };

describe('GET /reports/portfolio-at-risk', () => {
  it('answers 200 when the use case succeeds', async () => {
    const queries = new InMemoryQueryBus().register(PortfolioAtRiskPerBranchQuery, {
      execute: async () => ({ branches: [] }),
    });

    const route = nestControllerRoute(PortfolioAtRiskPerBranchController, {
      instanceOf: () => new PortfolioAtRiskPerBranchController(queries),
      schemaOfClass: (dto) => classSchema(dto, { validator: { forbidUnknownValues: false } }),
    });

    const response = await executeRoute(
      route,
      { params: {}, query: {}, headers: {}, body: {}, raw: undefined },
      { validateResponses: true, resolvePrincipal: () => caller },
    );

    expect(response.status).toBe(200);
    expect(route.path).toBe('/reports/portfolio-at-risk');
    expect(reportingControllers).toContain(PortfolioAtRiskPerBranchController);
  });

  it('answers each branch line of the use case with the public fields only', async () => {
    const result: PortfolioAtRiskPerBranchResult = {
      branches: [{ ...branchLine('branch-1'), paidOutCents: 1000, atRiskCents: 250, portfolioAtRiskBasisPoints: 2500 }],
    };

    const queries = new InMemoryQueryBus().register(PortfolioAtRiskPerBranchQuery, {
      execute: async () => result,
    });

    const route = nestControllerRoute(PortfolioAtRiskPerBranchController, {
      instanceOf: () => new PortfolioAtRiskPerBranchController(queries),
      schemaOfClass: (dto) => classSchema(dto, { validator: { forbidUnknownValues: false } }),
    });

    const response = await executeRoute(
      route,
      { params: {}, query: {}, headers: {}, body: {}, raw: undefined },
      { validateResponses: true, resolvePrincipal: () => caller },
    );

    expect(response.body).toEqual({
      branches: [{ ...branchLine('branch-1'), paidOutCents: 1000, atRiskCents: 250, portfolioAtRiskBasisPoints: 2500 }],
    });
  });
});

function branchLine(branchId: string): PortfolioAtRiskPerBranchResult['branches'][number] {
  return {
    branchId,
    paidOutCents: 0,
    oneToThirtyDaysCents: 0,
    thirtyOneToSixtyDaysCents: 0,
    sixtyOneToNinetyDaysCents: 0,
    overNinetyDaysCents: 0,
    atRiskCents: 0,
    portfolioAtRiskBasisPoints: 0,
  };
}
