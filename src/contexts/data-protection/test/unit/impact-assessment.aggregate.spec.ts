import { describe, expect, it } from '@jest/globals';
import { expectRefusal } from '@ddd-ts-kit/testing';
import { ImpactAssessment } from '@/contexts/data-protection/domain/aggregates/impact-assessment.aggregate';
import { anImpactAssessment } from '@/contexts/data-protection/test/builders/impact-assessment.builder';

describe('ImpactAssessment', () => {
  it('is born with its identity and its registration instant', () => {
    const bornAt = new Date('2026-03-01T00:00:00.000Z');

    const born = anImpactAssessment().identifiedBy('impact-assessment-7').bornAt(bornAt).build();

    expect(born.id).toBe('impact-assessment-7');
    expect(born.registeredAt).toEqual(bornAt);
  });

  it('is born assessing the scoring model version for the month it names', () => {
    const born = anImpactAssessment().forVersion('2026.2').forMonth('2026-05').build();

    expect(born.scoringModelVersion).toBe('2026.2');
    expect(born.month).toBe('2026-05');
  });

  it('is rehydrated in its stored state', () => {
    const stored = anImpactAssessment().build();

    const loaded = ImpactAssessment.rehydrate(stored.id, stored.toState());

    expect(loaded.toState()).toEqual(stored.toState());
  });

  it('identifies a record by the pair of its scoring model version and its month', () => {
    expect(ImpactAssessment.identifierOf(' 2026.2 ', '2026-05')).toBe('2026.2:2026-05');
  });

  it('refuses a blank scoring model version with INVALID_SCORING_MODEL_VERSION', () => {
    expectRefusal(() => anImpactAssessment().forVersion('   ').build(), 'INVALID_SCORING_MODEL_VERSION', {
      scoringModelVersion: '   ',
    });
  });

  it.each(['2026-13', '2026-5', 'may 2026'])('refuses the month %s, which is not written YYYY-MM', (month) => {
    expectRefusal(() => anImpactAssessment().forMonth(month).build(), 'INVALID_YEAR_MONTH', { text: month });
  });
});
