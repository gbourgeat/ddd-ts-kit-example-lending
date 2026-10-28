import { describe, expect, it } from '@jest/globals';
import { AuthorizationMap, RoleBasedAuthorizer, authorizationMiddleware, requires } from '@ddd-ts-kit/auth';
import { anActor } from '@ddd-ts-kit/auth/testing';
import { createTestBuses } from '@ddd-ts-kit/testing';
import { creditScoringPermissions } from '@/contexts/credit-scoring/credit-scoring.permissions';
import { ScoreApplicantHandler } from '@/contexts/credit-scoring/application/queries/score-applicant/score-applicant.handler';
import { ScoreApplicantQuery } from '@/contexts/credit-scoring/application/queries/score-applicant/score-applicant.query';
import { ScoringModel } from '@/contexts/credit-scoring/domain/aggregates/scoring-model.aggregate';
import { FakeScoringModelRepository } from '@/contexts/credit-scoring/test/fakes/scoring-model.repository.fake';

const holders = authorizationMiddleware({
  authorizer: new RoleBasedAuthorizer({
    roles: { holder: [creditScoringPermissions['score.compute']] },
  }),
  map: AuthorizationMap.of(requires(ScoreApplicantQuery, creditScoringPermissions['score.compute'])),
});

const holder = anActor().withRole('holder').build();
const soundInputs = { debtToIncomePercent: 20, repaymentIncidents: 0, residualIncomeCents: 120000 };
const redInputs = { debtToIncomePercent: 45, repaymentIncidents: 2, residualIncomeCents: 120000 };
const publishedLabel = '2026.1';

describe('Score applicant', () => {
  it('answers the score, its band, the model version, the inputs and the factors in words', async () => {
    const repository = await repositoryWithVersion(publishedLabel);
    const queryBus = arrange(repository);

    const answer = await queryBus.execute(new ScoreApplicantQuery(holder, redInputs, publishedLabel));

    expect(answer).toEqual({
      score: 20,
      band: 'red',
      modelVersion: publishedLabel,
      inputs: redInputs,
      factors: [
        'Your debts take a large share of your income',
        'A repayment incident is registered in your name',
        'A repayment incident is registered in your name',
      ],
    });
  });

  it('answers a clean applicant with a score of 100, the green band and no factor', async () => {
    const repository = await repositoryWithVersion(publishedLabel);
    const queryBus = arrange(repository);

    const answer = await queryBus.execute(new ScoreApplicantQuery(holder, soundInputs, publishedLabel));

    expect(answer).toMatchObject({ score: 100, band: 'green', factors: [] });
  });

  it('refuses a model version label that no published version carries with the code UNKNOWN_MODEL_VERSION', async () => {
    const repository = await repositoryWithVersion(publishedLabel);
    const queryBus = arrange(repository);

    const answer = queryBus.execute(new ScoreApplicantQuery(holder, soundInputs, '2030.9'));

    await expect(answer).rejects.toMatchObject({ code: 'UNKNOWN_MODEL_VERSION' });
  });

  it('is refused to an actor who does not hold the permission score.compute', async () => {
    const repository = await repositoryWithVersion(publishedLabel);
    const queryBus = arrange(repository);

    const answer = queryBus.execute(new ScoreApplicantQuery(anActor().build(), soundInputs, publishedLabel));

    await expect(answer).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });
});

async function repositoryWithVersion(label: string): Promise<FakeScoringModelRepository> {
  const repository = new FakeScoringModelRepository();
  const now = new Date('2026-01-15T09:00:00Z');
  const scoringModel = ScoringModel.create(ScoringModel.BANK_ID, now);

  scoringModel.publish('version-1', 'medium', label, now);
  await repository.save(scoringModel);

  return repository;
}

function arrange(repository: FakeScoringModelRepository) {
  const { queryBus } = createTestBuses();
  const handler = new ScoreApplicantHandler(repository);

  return queryBus.use(holders).register(ScoreApplicantQuery, handler);
}
