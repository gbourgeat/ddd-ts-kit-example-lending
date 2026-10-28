import { describe, expect, it } from '@jest/globals';
import { controllerRoute, executeRoute } from '@ddd-ts-kit/http';
import { InMemoryCommandBus, type Actor } from '@ddd-ts-kit/kernel';
import { RecordScoringImpactAssessmentCommand } from '@/contexts/data-protection/application/commands/record-scoring-impact-assessment/record-scoring-impact-assessment.command';
import { RecordScoringImpactAssessmentController } from '@/contexts/data-protection/presentation/http/impact-assessments/record-scoring-impact-assessment/record-scoring-impact-assessment.controller';

const caller: Actor = { id: 'user-1', type: 'user', roles: [], attributes: {} };

describe('POST /impact-assessments', () => {
  it('answers 201 with the identifier, and gives the use case the version and the month sent', async () => {
    let received: RecordScoringImpactAssessmentCommand | undefined;

    const commands = new InMemoryCommandBus().register(RecordScoringImpactAssessmentCommand, {
      execute: async (command: RecordScoringImpactAssessmentCommand) => {
        received = command;

        return '2026.2:2026-05';
      },
    });

    const route = controllerRoute(new RecordScoringImpactAssessmentController(commands));

    const response = await executeRoute(
      route,
      {
        params: {},
        query: {},
        headers: {},
        body: { scoringModelVersion: '2026.2', month: '2026-05' },
        raw: undefined,
      },
      { validateResponses: true, resolvePrincipal: () => caller },
    );

    expect(response.status).toBe(201);
    expect(response.body).toEqual({ id: '2026.2:2026-05' });
    expect(received).toMatchObject({ scoringModelVersion: '2026.2', month: '2026-05' });
    expect(route.path).toBe('/impact-assessments');
  });
});
