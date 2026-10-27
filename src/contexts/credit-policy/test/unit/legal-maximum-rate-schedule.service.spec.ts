import { describe, expect, it } from '@jest/globals';
import { expectRefusal } from '@ddd-ts-kit/testing';
import { LegalMaximumRateScheduleService } from '@/contexts/credit-policy/domain/services/legal-maximum-rate-schedule.service';
import { LegalMaximumRateTerms } from '@/contexts/credit-policy/domain/value-objects/legal-maximum-rate-terms.vo';
import { aLegalMaximumRate } from '@/contexts/credit-policy/test/builders/legal-maximum-rate.builder';

const latestEffectiveFrom = new Date('2026-10-01T00:00:00.000Z');
const schedule = new LegalMaximumRateScheduleService();

describe('LegalMaximumRateScheduleService', () => {
  it('holds no state of its own', () => {
    expect(Object.keys(new LegalMaximumRateScheduleService())).toEqual([]);
  });

  it('accepts a rate taking effect after the latest rate of its category', () => {
    const latest = aLegalMaximumRate().forCategory('car').takingEffectOn(latestEffectiveFrom).build();
    const terms = termsFor('car', new Date('2026-11-01T00:00:00.000Z'));

    expect(() => schedule.ensureNotBeforeLatest(terms, latest)).not.toThrow();
  });

  it('accepts any rate when its category has no rate yet', () => {
    const terms = termsFor('term', new Date('2026-01-01T00:00:00.000Z'));

    expect(() => schedule.ensureNotBeforeLatest(terms, undefined)).not.toThrow();
  });

  it('refuses a rate taking effect before the latest rate of its category with the code INVALID_LEGAL_MAXIMUM_RATE', () => {
    const latest = aLegalMaximumRate().forCategory('car').takingEffectOn(latestEffectiveFrom).build();
    const terms = termsFor('car', new Date('2026-09-01T00:00:00.000Z'));

    expectRefusal(() => schedule.ensureNotBeforeLatest(terms, latest), 'INVALID_LEGAL_MAXIMUM_RATE');
  });
});

function termsFor(category: string, effectiveFrom: Date): LegalMaximumRateTerms {
  return LegalMaximumRateTerms.create({ category, rateBasisPoints: 1450, effectiveFrom });
}
