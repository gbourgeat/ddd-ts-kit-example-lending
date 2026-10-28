import { describe, expect, it } from '@jest/globals';
import { executeRoute } from '@ddd-ts-kit/http';
import { nestControllerRoute } from '@ddd-ts-kit/http/nest';
import { classSchema } from '@ddd-ts-kit/validation/class-validator';
import { createTestBuses } from '@ddd-ts-kit/testing';
import { InMemoryCommandBus, type Actor } from '@ddd-ts-kit/kernel';
import { PublishScoringModelVersionCommand } from '@/contexts/credit-scoring/application/commands/publish-scoring-model-version/publish-scoring-model-version.command';
import { PublishScoringModelVersionHandler } from '@/contexts/credit-scoring/application/commands/publish-scoring-model-version/publish-scoring-model-version.handler';
import { PublishScoringModelVersionController } from '@/contexts/credit-scoring/presentation/http/scoring-models/publish-scoring-model-version/publish-scoring-model-version.controller';
import { creditScoringControllers } from '@/contexts/credit-scoring/credit-scoring.controllers';
import { FakeScoringModelRepository } from '@/contexts/credit-scoring/test/fakes/scoring-model.repository.fake';

const caller: Actor = { id: 'user-1', type: 'user', roles: [], attributes: {} };

describe('POST /scoring-models', () => {
  it('answers 201 with the published version: its id, number, model risk and label', async () => {
    const { ids, clock } = createTestBuses({ idPrefix: 'scoring-model' });

    const commands = new InMemoryCommandBus().register(
      PublishScoringModelVersionCommand,
      new PublishScoringModelVersionHandler(new FakeScoringModelRepository(), ids, clock),
    );

    const route = nestControllerRoute(PublishScoringModelVersionController, {
      instanceOf: () => new PublishScoringModelVersionController(commands),
      schemaOfClass: (dto) => classSchema(dto, { validator: { forbidUnknownValues: false } }),
    });

    const response = await executeRoute(
      route,
      { params: {}, query: {}, headers: {}, body: { modelRisk: 'medium', label: '2026.1' }, raw: undefined },
      { validateResponses: true, resolvePrincipal: () => caller },
    );

    expect(response.status).toBe(201);
    expect(route.path).toBe('/scoring-models');
    expect(response.body).toMatchObject({ number: 1, modelRisk: 'medium', label: '2026.1' });
    expect(creditScoringControllers).toContain(PublishScoringModelVersionController);
  });
});
