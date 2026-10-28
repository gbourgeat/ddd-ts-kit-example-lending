import { describe, expect, it } from '@jest/globals';
import { executeRoute } from '@ddd-ts-kit/http';
import { nestControllerRoute } from '@ddd-ts-kit/http/nest';
import { classSchema } from '@ddd-ts-kit/validation/class-validator';
import { InMemoryCommandBus, type Actor } from '@ddd-ts-kit/kernel';
import { AssessApplicationCommand } from '@/contexts/credit-application/assessment/application/commands/assess-application/assess-application.command';
import { AssessApplicationController } from '@/contexts/credit-application/assessment/presentation/http/applications/assess-application/assess-application.controller';
import { creditApplicationControllers } from '@/contexts/credit-application/credit-application.controllers';

const caller: Actor = { id: 'user-1', type: 'user', roles: [], attributes: {} };

describe('POST /applications/:id/assessment', () => {
  it('answers 201 with the assessment of the application and the outcome it proposes', async () => {
    const commands = new InMemoryCommandBus().register(AssessApplicationCommand, {
      execute: async () => ({
        applicationId: 'id-1',
        assessment: {
          modelVersion: '2026.1',
          debtToIncomePercent: 36,
          repaymentIncidents: 0,
          residualIncomeCents: 160_000,
          score: 85,
          band: 'green',
          factors: [],
          proposedOutcome: 'approve' as const,
        },
      }),
    });

    const route = nestControllerRoute(AssessApplicationController, {
      instanceOf: () => new AssessApplicationController(commands),
      // A DTO without a decorated field yet accepts the empty object alone: whitelist and forbidNonWhitelisted refuse any field.
      schemaOfClass: (dto) => classSchema(dto, { validator: { forbidUnknownValues: false } }),
    });

    const response = await executeRoute(
      route,
      { params: { id: 'id-1' }, query: {}, headers: {}, body: {}, raw: undefined },
      { validateResponses: true, resolvePrincipal: () => caller },
    );

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({ applicationId: 'id-1', modelVersion: '2026.1', proposedOutcome: 'approve' });
    expect(route.path).toBe('/applications/:id/assessment');
    expect(creditApplicationControllers).toContain(AssessApplicationController);
  });
});
