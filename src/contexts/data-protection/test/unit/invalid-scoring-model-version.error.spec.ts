import { describe, expect, it } from '@jest/globals';
import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { InvalidScoringModelVersion } from '@/contexts/data-protection/domain/errors/invalid-scoring-model-version.error';

describe('InvalidScoringModelVersion', () => {
  it('refuses a blank version, with the code INVALID_SCORING_MODEL_VERSION', () => {
    const error = InvalidScoringModelVersion.forVersion('  ');

    expect(error).toBeInstanceOf(DomainRefusal);
    expect(error.code).toBe('INVALID_SCORING_MODEL_VERSION');
    expect(error.facts).toEqual({ scoringModelVersion: '  ' });
  });
});
