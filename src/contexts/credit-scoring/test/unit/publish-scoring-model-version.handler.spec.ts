import { describe, expect, it } from '@jest/globals';
import { AuthorizationMap, RoleBasedAuthorizer, authorizationMiddleware, requires } from '@ddd-ts-kit/auth';
import { anActor } from '@ddd-ts-kit/auth/testing';
import { createTestBuses } from '@ddd-ts-kit/testing';
import { creditScoringPermissions } from '@/contexts/credit-scoring/credit-scoring.permissions';
import { PublishScoringModelVersionCommand } from '@/contexts/credit-scoring/application/commands/publish-scoring-model-version/publish-scoring-model-version.command';
import { PublishScoringModelVersionHandler } from '@/contexts/credit-scoring/application/commands/publish-scoring-model-version/publish-scoring-model-version.handler';
import { FakeScoringModelRepository } from '@/contexts/credit-scoring/test/fakes/scoring-model.repository.fake';

const holders = authorizationMiddleware({
  authorizer: new RoleBasedAuthorizer({
    roles: { holder: [creditScoringPermissions['scoring-model.publish']] },
  }),
  map: AuthorizationMap.of(
    requires(PublishScoringModelVersionCommand, creditScoringPermissions['scoring-model.publish']),
  ),
});

const holder = anActor().withRole('holder').build();

describe('Publish scoring model version', () => {
  it('saves the scoring model with its first version, numbered 1', async () => {
    const { commandBus, scoringModelRepository } = arrange();

    const version = await commandBus.execute(new PublishScoringModelVersionCommand(holder, 'low', '2026.1'));

    const stored = await scoringModelRepository.findById('bank-scoring-model');

    expect(stored?.versions.map((published) => published.id)).toEqual([version.id]);
    expect(version.number).toBe(1);
  });

  it('numbers the next version after the versions already published', async () => {
    const { commandBus } = arrange();

    await commandBus.execute(new PublishScoringModelVersionCommand(holder, 'low', '2026.1'));

    const second = await commandBus.execute(new PublishScoringModelVersionCommand(holder, 'high', '2026.2'));

    expect(second.number).toBe(2);
    expect(second.modelRisk).toBe('high');
  });

  it('is refused to an actor who does not hold the permission scoring-model.publish', async () => {
    const { commandBus } = arrange();
    const command = new PublishScoringModelVersionCommand(anActor().build(), 'low', '2026.1');

    await expect(commandBus.execute(command)).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });

  it('refuses a blank label with SCORING_MODEL_LABEL_REQUIRED and saves nothing', async () => {
    const { commandBus, scoringModelRepository } = arrange();
    const command = new PublishScoringModelVersionCommand(holder, 'low', '  ');

    await expect(commandBus.execute(command)).rejects.toMatchObject({ code: 'SCORING_MODEL_LABEL_REQUIRED' });
    expect(await scoringModelRepository.findById('bank-scoring-model')).toBeUndefined();
  });
});

function arrange() {
  const { commandBus, clock, ids, dispatching } = createTestBuses({ idPrefix: 'scoring-model' });
  // As the application hands it to the handler: the save announces the events of the scoring model to `domainEvents`.
  const scoringModelRepository = dispatching(new FakeScoringModelRepository());

  const handler = new PublishScoringModelVersionHandler(scoringModelRepository, ids, clock);

  commandBus.use(holders).register(PublishScoringModelVersionCommand, handler);

  return { commandBus, scoringModelRepository };
}
