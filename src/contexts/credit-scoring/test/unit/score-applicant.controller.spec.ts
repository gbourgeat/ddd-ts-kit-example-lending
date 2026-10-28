import { describe, expect, it } from '@jest/globals';
import { executeRoute } from '@ddd-ts-kit/http';
import { nestControllerRoute } from '@ddd-ts-kit/http/nest';
import { classSchema } from '@ddd-ts-kit/validation/class-validator';
import { InMemoryQueryBus, type Actor } from '@ddd-ts-kit/kernel';
import { ScoreApplicantQuery } from '@/contexts/credit-scoring/application/queries/score-applicant/score-applicant.query';
import { ScoreApplicantController } from '@/contexts/credit-scoring/presentation/http/scores/score-applicant/score-applicant.controller';
import { creditScoringControllers } from '@/contexts/credit-scoring/credit-scoring.controllers';
import { UnknownModelVersion } from '@/contexts/credit-scoring/domain/errors/unknown-model-version.error';

const caller: Actor = { id: 'user-1', type: 'user', roles: [], attributes: {} };
const inputs = { debtToIncomePercent: 20, repaymentIncidents: 0, residualIncomeCents: 120000 };

describe('POST /scores', () => {
  it('answers 200 with the score, its band and the factors when the use case succeeds', async () => {
    const queries = new InMemoryQueryBus().register(ScoreApplicantQuery, {
      execute: async () => ({
        score: 100,
        band: 'green' as const,
        modelVersion: '2026.1',
        inputs,
        factors: [],
      }),
    });

    const route = nestControllerRoute(ScoreApplicantController, {
      instanceOf: () => new ScoreApplicantController(queries),
      schemaOfClass: (dto) => classSchema(dto, { validator: { forbidUnknownValues: false } }),
    });

    const response = await executeRoute(
      route,
      {
        params: {},
        query: {},
        headers: {},
        body: { ...inputs, modelVersion: '2026.1' },
        raw: undefined,
      },
      { validateResponses: true, resolvePrincipal: () => caller },
    );

    expect(response.status).toBe(200);
    expect(route.path).toBe('/scores');
    expect(creditScoringControllers).toContain(ScoreApplicantController);
  });

  it('refuses a count of repayment incidents that is negative with 422, before the use case runs', async () => {
    const queries = new InMemoryQueryBus().register(ScoreApplicantQuery, {
      execute: async () => {
        throw new Error('the use case must not run for an input that has the wrong shape');
      },
    });

    const route = nestControllerRoute(ScoreApplicantController, {
      instanceOf: () => new ScoreApplicantController(queries),
      schemaOfClass: (dto) => classSchema(dto, { validator: { forbidUnknownValues: false } }),
    });

    const response = await executeRoute(
      route,
      {
        params: {},
        query: {},
        headers: {},
        body: { ...inputs, repaymentIncidents: -1, modelVersion: '2026.1' },
        raw: undefined,
      },
      { validateResponses: true, resolvePrincipal: () => caller },
    );

    expect(response.status).toBe(422);
  });

  it('answers 422 when the model version label is unknown, as the use case refuses it', async () => {
    const queries = new InMemoryQueryBus().register(ScoreApplicantQuery, {
      execute: async () => {
        throw UnknownModelVersion.forLabel('2030.9');
      },
    });

    const route = nestControllerRoute(ScoreApplicantController, {
      instanceOf: () => new ScoreApplicantController(queries),
      schemaOfClass: (dto) => classSchema(dto, { validator: { forbidUnknownValues: false } }),
    });

    const response = await executeRoute(
      route,
      {
        params: {},
        query: {},
        headers: {},
        body: { ...inputs, modelVersion: '2030.9' },
        raw: undefined,
      },
      { validateResponses: true, resolvePrincipal: () => caller },
    );

    expect(response.status).toBe(422);
  });
});
