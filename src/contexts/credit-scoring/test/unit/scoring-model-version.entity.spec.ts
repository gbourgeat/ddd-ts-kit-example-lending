import { describe, expect, it } from '@jest/globals';
import { expectRefusal } from '@ddd-ts-kit/testing';
import {
  ScoringModelVersion,
  type ScoringModelVersionState,
} from '@/contexts/credit-scoring/domain/entities/scoring-model-version.entity';

const published: ScoringModelVersionState = {
  number: 1,
  modelRisk: 'medium',
  label: '2026.1',
  publishedAt: new Date('2026-03-01T00:00:00.000Z'),
};

describe('ScoringModelVersion', () => {
  it('is identified by its id, not by its attributes', () => {
    const first = ScoringModelVersion.create('scoring-model-version-1', published);
    const same = ScoringModelVersion.rehydrate('scoring-model-version-1', published);
    const other = ScoringModelVersion.create('scoring-model-version-2', published);

    expect(first.equals(same)).toBe(true);
    expect(first.equals(other)).toBe(false);
  });

  it('gives back the state it was rehydrated from, as a copy', () => {
    const stored = ScoringModelVersion.rehydrate('scoring-model-version-1', published);

    expect(stored.toState()).toEqual(published);
    expect(stored.toState()).not.toBe(published);
  });

  it('refuses a label that is blank, as the label required refusal', () => {
    expectRefusal(
      () => ScoringModelVersion.create('scoring-model-version-1', { ...published, label: '   ' }),
      'SCORING_MODEL_LABEL_REQUIRED',
    );
  });

  it('accepts a label that names the version, and keeps its number and model risk', () => {
    const version = ScoringModelVersion.create('scoring-model-version-1', published);

    expect(version.label).toBe('2026.1');
    expect(version.number).toBe(1);
    expect(version.modelRisk).toBe('medium');
  });
});
