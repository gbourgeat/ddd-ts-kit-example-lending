import { describe, expect, it } from '@jest/globals';
import { ScoringModel } from '@/contexts/credit-scoring/domain/aggregates/scoring-model.aggregate';
import { ScoringAnswer } from '@/contexts/credit-scoring/infrastructure/external/scoring.answer';
import { FakeScoringModelRepository } from '@/contexts/credit-scoring/test/fakes/scoring-model.repository.fake';

const redInputs = { debtToIncomePercent: 45, repaymentIncidents: 2, residualIncomeCents: 120000 };
const now = new Date('2026-01-15T09:00:00Z');

describe('Scoring answer', () => {
  it('scores the applicant with the latest published version, in words a customer understands', async () => {
    const repository = new FakeScoringModelRepository();
    const scoringModel = ScoringModel.create(ScoringModel.BANK_ID, now);

    scoringModel.publish('version-1', 'medium', '2026.1', now);
    scoringModel.publish('version-2', 'medium', '2026.2', now);
    await repository.save(scoringModel);

    const answer = await new ScoringAnswer(repository).scoreOf(redInputs);

    expect(answer).toEqual({
      score: 20,
      band: 'red',
      modelVersion: '2026.2',
      factors: [
        'Your debts take a large share of your income',
        'A repayment incident is registered in your name',
        'A repayment incident is registered in your name',
      ],
    });
  });

  it('answers nothing while no version of the model is published', async () => {
    const answer = await new ScoringAnswer(new FakeScoringModelRepository()).scoreOf(redInputs);

    expect(answer).toBeUndefined();
  });
});
