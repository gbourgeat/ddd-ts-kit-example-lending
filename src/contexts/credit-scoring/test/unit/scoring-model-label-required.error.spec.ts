import { describe, expect, it } from '@jest/globals';
import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { ScoringModelLabelRequired } from '@/contexts/credit-scoring/domain/errors/scoring-model-label-required.error';

describe('ScoringModelLabelRequired', () => {
  it('refuses for label with the code SCORING_MODEL_LABEL_REQUIRED', () => {
    const error = ScoringModelLabelRequired.forLabel();

    expect(error).toBeInstanceOf(DomainRefusal);
    expect(error.code).toBe('SCORING_MODEL_LABEL_REQUIRED');
    expect(error.message).toBe('Scoring model label required.');
    expect(error.facts).toEqual({});
  });
});
