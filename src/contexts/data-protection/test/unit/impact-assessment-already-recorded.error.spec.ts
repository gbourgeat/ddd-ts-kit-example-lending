import { describe, expect, it } from '@jest/globals';
import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { ImpactAssessmentAlreadyRecorded } from '@/contexts/data-protection/domain/errors/impact-assessment-already-recorded.error';

describe('ImpactAssessmentAlreadyRecorded', () => {
  it('refuses a second record of the pair, with the code IMPACT_ASSESSMENT_ALREADY_RECORDED', () => {
    const error = ImpactAssessmentAlreadyRecorded.forVersionAndMonth('2026.2', '2026-05');

    expect(error).toBeInstanceOf(DomainRefusal);
    expect(error.code).toBe('IMPACT_ASSESSMENT_ALREADY_RECORDED');
    expect(error.facts).toEqual({ scoringModelVersion: '2026.2', month: '2026-05' });
  });
});
