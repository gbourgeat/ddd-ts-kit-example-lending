import { describe, expect, it } from '@jest/globals';
import { expectRefusal, given } from '@ddd-ts-kit/testing';
import { ScoringModel } from '@/contexts/credit-scoring/domain/aggregates/scoring-model.aggregate';
import { aScoringModel } from '@/contexts/credit-scoring/test/builders/scoring-model.builder';

const publishedAt = new Date('2026-03-01T00:00:00.000Z');

describe('ScoringModel', () => {
  it('is born with its identity and no version', () => {
    const bornAt = new Date('2026-03-01T00:00:00.000Z');

    const born = aScoringModel().identifiedBy('scoring-model-7').bornAt(bornAt).build();

    expect(born.id).toBe('scoring-model-7');
    expect(born.registeredAt).toEqual(bornAt);
    expect(born.versions).toEqual([]);
  });

  it('is rehydrated in its stored state without recording a new fact', () => {
    const stored = aScoringModel().build();

    const loaded = ScoringModel.rehydrate(stored.id, stored.toState());

    expect(loaded.toState()).toEqual(stored.toState());
    expect(loaded.pullEvents()).toEqual([]);
  });

  it('numbers the first published version 1, with its label and model risk', () => {
    const scoringModel = aScoringModel().build();

    const version = scoringModel.publish('version-1', 'low', '2026.1', publishedAt);

    expect(version.number).toBe(1);
    expect(version.label).toBe('2026.1');
    expect(version.modelRisk).toBe('low');
  });

  it('numbers each next version after the last one published', () => {
    const scoringModel = aScoringModel().build();

    scoringModel.publish('version-1', 'low', '2026.1', publishedAt);

    const second = scoringModel.publish('version-2', 'high', '2026.2', publishedAt);

    expect(second.number).toBe(2);
    expect(scoringModel.versions.map((version) => version.number)).toEqual([1, 2]);
  });

  it('records the fact of each publication, with the version it announces', () => {
    const scoringModel = aScoringModel().build();

    scoringModel.publish('version-1', 'medium', '2026.1', publishedAt);

    expect(scoringModel.pullEvents()).toMatchObject([
      {
        name: 'credit-scoring.scoring-model.published',
        aggregateId: scoringModel.id,
        versionId: 'version-1',
        number: 1,
        modelRisk: 'medium',
        label: '2026.1',
      },
    ]);
  });

  it('refuses a blank label and publishes no version', () => {
    const scoringModel = aScoringModel().build();

    expectRefusal(() => scoringModel.publish('version-1', 'low', ' ', publishedAt), 'SCORING_MODEL_LABEL_REQUIRED');
    expect(scoringModel.versions).toEqual([]);
  });

  it('records nothing as long as no business intention is expressed', () => {
    given(aScoringModel())
      .when((subject) => subject.toState())
      .thenEvents([]);
  });
});
